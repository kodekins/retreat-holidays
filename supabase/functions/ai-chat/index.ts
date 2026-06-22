import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TravelResult {
  id: string;
  name: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  currency: string;
  description: string;
  activities: string[];
  source: string;
  url?: string;
  image?: string;
  category?: string;
  dates?: string | null;
  type: "retreat" | "holiday" | "experience";
}

// Fallback images when no image found
const fallbackImages: Record<string, string> = {
  thailand: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  india: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "costa rica": "https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=800&q=80",
  mexico: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
  portugal: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  spain: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
  greece: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
  maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  italy: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
  france: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  japan: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  yoga: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
  meditation: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  wellness: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  adventure: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
  default: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
};

function getFallbackImage(item: any): string {
  const text = `${item.location || ""} ${item.country || ""} ${item.activities?.join(" ") || ""} ${item.name || ""}`.toLowerCase();
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (key !== "default" && text.includes(key)) return url;
  }
  return fallbackImages.default;
}

// Optional: curated retreats from database (supplement to scraping)
async function searchCuratedRetreats(preferences: any): Promise<TravelResult[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let query = supabase
      .from("curated_retreats")
      .select("*")
      .not("booking_url", "is", null)
      .neq("booking_url", "")
      .order("featured", { ascending: false });

    if (preferences?.budget) {
      query = query.lte("price", parseInt(preferences.budget));
    }
    if (preferences?.location) {
      const loc = preferences.location.toLowerCase();
      query = query.or(`location.ilike.%${loc}%,country.ilike.%${loc}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error("Verified provider search error:", error);
      return [];
    }

    const holidayCategories = ["adventure", "surf", "cultural"];
    const retreatCategories = ["yoga", "meditation", "wellness", "detox", "spiritual", "ayurveda", "healing", "silent"];

    const mapped = (data || [])
      .filter((r: any) => r.booking_url?.trim())
      .map((r: any) => {
        const category = String(r.category || "").toLowerCase();
        const isHoliday = holidayCategories.some((c) => category.includes(c));
        return {
          id: r.id,
          name: r.name,
          location: r.location,
          country: r.country,
          duration: r.duration,
          price: Number(r.price),
          currency: r.currency || "USD",
          description: r.description,
          activities: r.activities || [],
          source: "Verified Provider",
          url: r.booking_url,
          image: r.image_url || getFallbackImage(r),
          category: r.category,
          dates: r.dates ?? null,
          type: (isHoliday ? "holiday" : "retreat") as "retreat" | "holiday",
        };
      });

    if (preferences?.tripType === "holiday") {
      const holidays = mapped.filter((r) => r.type === "holiday");
      if (holidays.length > 0) return holidays;
    }
    if (preferences?.tripType === "retreat") {
      const retreats = mapped.filter((r) => r.type === "retreat");
      if (retreats.length > 0) return retreats;
    }

    return mapped;
  } catch (error) {
    console.error("Verified provider search error:", error);
    return [];
  }
}

// Scrape and extract details from a single retreat page
async function scrapeRetreatPage(url: string, apiKey: string): Promise<TravelResult | null> {
  try {
    console.log("Scraping retreat page:", url);
    
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      console.log("Scrape failed:", response.status);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || "";
    const metadata = data.data?.metadata || {};
    
    if (!markdown || markdown.length < 100) return null;

    // Extract retreat name from title or content
    let name = metadata.title || "";
    name = name.replace(/\s*[-|].*$/, "").replace(/BookRetreats|BookYogaRetreats/gi, "").trim();
    if (!name || name.length < 5) {
      const headingMatch = markdown.match(/^#\s*(.+?)[\n\r]/m);
      name = headingMatch ? headingMatch[1].trim() : "Wellness Retreat";
    }
    name = name.substring(0, 80);

    // Extract price - look for various patterns
    let price = 0;
    const pricePatterns = [
      /From\s*\$\s*(\d{1,3}(?:,\d{3})*|\d+)/i,
      /\$\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:USD|per person)?/i,
      /Price[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*|\d+)/i,
      /Starting\s+(?:at|from)\s*\$?\s*(\d+)/i,
      /USD\s*(\d{1,3}(?:,\d{3})*|\d+)/i,
      /(\d{1,3}(?:,\d{3})*)\s*USD/i,
    ];
    for (const pattern of pricePatterns) {
      const match = markdown.match(pattern);
      if (match) {
        price = parseInt(match[1].replace(/,/g, ""));
        if (price > 50 && price < 50000) break;
        price = 0;
      }
    }
    if (price === 0) price = 899; // Default if not found

    // Extract location and country
    let location = "";
    let country = "";
    const locationPatterns = [
      /(?:Location|Where)[:\s]+([^,\n]+),\s*([^,\n]+)/i,
      /(?:in|at)\s+([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)/,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*(Thailand|Bali|Indonesia|India|Costa Rica|Mexico|Portugal|Spain|Greece|Sri Lanka|Nepal|Peru|Vietnam|Cambodia)/i,
    ];
    for (const pattern of locationPatterns) {
      const match = markdown.match(pattern);
      if (match) {
        location = match[1].trim();
        country = match[2].trim();
        break;
      }
    }
    // Try to extract country from URL or content
    const countries = ["Thailand", "Bali", "Indonesia", "India", "Costa Rica", "Mexico", "Portugal", "Spain", "Greece", "Sri Lanka", "Nepal", "Peru", "Vietnam", "Cambodia", "Maldives", "Hawaii", "Italy", "France", "Japan"];
    if (!country) {
      for (const c of countries) {
        if (url.toLowerCase().includes(c.toLowerCase()) || markdown.toLowerCase().includes(c.toLowerCase())) {
          country = c;
          break;
        }
      }
    }
    if (!location) location = country || "Scenic Location";

    // Extract duration
    let duration = "7 days";
    const durationPatterns = [
      /(\d+)\s*(?:Day|Night)s?\s*(?:\/\s*\d+\s*(?:Day|Night)s?)?/i,
      /Duration[:\s]+(\d+)\s*(?:day|night)/i,
    ];
    for (const pattern of durationPatterns) {
      const match = markdown.match(pattern);
      if (match) {
        duration = `${match[1]} days`;
        break;
      }
    }

    // Extract activities
    const activityKeywords = ["yoga", "meditation", "spa", "massage", "detox", "wellness", "healing", "ayurveda", "surf", "hiking", "breathwork", "pilates", "sound healing", "reiki"];
    const activities = activityKeywords.filter(act => 
      markdown.toLowerCase().includes(act)
    ).slice(0, 5);
    if (activities.length === 0) activities.push("Wellness", "Relaxation");

    // Extract image - look for image URLs in content
    let image = "";
    const imagePatterns = [
      /!\[.*?\]\((https?:\/\/[^\s\)]+\.(?:jpg|jpeg|png|webp)[^\s\)]*)\)/i,
      /(https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp))/i,
      /og:image["\s]+content=["']([^"']+)/i,
      /image["\s]*:["\s]*["']([^"']+)/i,
    ];
    for (const pattern of imagePatterns) {
      const match = markdown.match(pattern) || metadata.ogImage;
      if (match) {
        image = typeof match === "string" ? match : match[1];
        if (image && image.startsWith("http")) break;
      }
    }
    if (metadata.ogImage) image = metadata.ogImage;
    
    // Extract description
    let description = metadata.description || "";
    if (!description) {
      const descMatch = markdown.match(/(?:About|Overview|Description)[:\s]*\n([^\n]+(?:\n[^\n#]+){0,2})/i);
      description = descMatch ? descMatch[1].trim() : markdown.substring(0, 250);
    }
    description = description.replace(/\n/g, " ").replace(/\s+/g, " ").substring(0, 200) + "...";

    const source = url.includes("bookyogaretreats") ? "BookYogaRetreats" : "BookRetreats";

    const result: TravelResult = {
      id: `retreat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      location,
      country,
      duration,
      price,
      currency: "USD",
      description,
      activities: activities.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
      source,
      url,
      image: image || getFallbackImage({ location, country, activities }),
      type: "retreat",
    };

    console.log("Extracted retreat:", result.name, result.price, result.location);
    return result;
  } catch (error) {
    console.error("Scrape error:", error);
    return null;
  }
}

// Scrape holiday page for details
async function scrapeHolidayPage(url: string, apiKey: string): Promise<TravelResult | null> {
  try {
    console.log("Scraping holiday page:", url);
    
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const markdown = data.data?.markdown || "";
    const metadata = data.data?.metadata || {};
    
    if (!markdown || markdown.length < 100) return null;

    let name = metadata.title || "";
    name = name.replace(/\s*[-|–].*TripAdvisor.*$/i, "")
               .replace(/\s*[-|–].*Booking\.com.*$/i, "")
               .replace(/\s*[-|–].*Viator.*$/i, "")
               .trim()
               .substring(0, 80);

    // Extract price
    let price = 0;
    const pricePatterns = [
      /From\s*\$\s*(\d{1,3}(?:,\d{3})*|\d+)/i,
      /\$\s*(\d{1,3}(?:,\d{3})*|\d+)/i,
      /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:USD|per person)/i,
    ];
    for (const pattern of pricePatterns) {
      const match = markdown.match(pattern);
      if (match) {
        price = parseInt(match[1].replace(/,/g, ""));
        if (price > 20 && price < 50000) break;
        price = 0;
      }
    }
    if (price === 0) price = 1299;

    // Extract location
    let location = "";
    let country = "";
    const locationMatch = markdown.match(/(?:in|at|to)\s+([A-Z][a-zA-Z\s]+),?\s*([A-Z][a-zA-Z\s]+)?/);
    if (locationMatch) {
      location = locationMatch[1].trim();
      country = locationMatch[2]?.trim() || "";
    }
    if (!location) location = "Beautiful Destination";

    // Duration
    let duration = "5 days";
    const durationMatch = markdown.match(/(\d+)\s*(?:day|night|hour)/i);
    if (durationMatch) {
      duration = `${durationMatch[1]} days`;
    }

    // Activities
    const holidayKeywords = ["tour", "sightseeing", "beach", "adventure", "culture", "safari", "cruise", "food", "wine", "history"];
    const activities = holidayKeywords.filter(act => markdown.toLowerCase().includes(act)).slice(0, 5);
    if (activities.length === 0) activities.push("Sightseeing", "Exploration");

    // Image
    let image = metadata.ogImage || "";
    if (!image) {
      const imgMatch = markdown.match(/(https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp))/i);
      if (imgMatch) image = imgMatch[1];
    }

    // Description
    let description = metadata.description || markdown.substring(0, 200);
    description = description.replace(/\n/g, " ").replace(/\s+/g, " ").substring(0, 200) + "...";

    let source = "Travel Site";
    if (url.includes("tripadvisor")) source = "TripAdvisor";
    else if (url.includes("booking.com")) source = "Booking.com";
    else if (url.includes("viator")) source = "Viator";

    return {
      id: `holiday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || `${location} Holiday Package`,
      location,
      country,
      duration,
      price,
      currency: "USD",
      description,
      activities: activities.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
      source,
      url,
      image: image || getFallbackImage({ location, country, activities }),
      type: "holiday",
    };
  } catch (error) {
    console.error("Holiday scrape error:", error);
    return null;
  }
}

// Search and find MULTIPLE retreat matches
async function findBestRetreats(query: string, preferences: any): Promise<TravelResult[]> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return [];

  try {
    const searchTerms: string[] = [];
    if (query) searchTerms.push(query);
    if (preferences?.location) searchTerms.push(preferences.location);
    if (preferences?.activities) searchTerms.push(preferences.activities);
    if (preferences?.duration) searchTerms.push(`${preferences.duration} day`);
    if (preferences?.date) searchTerms.push(preferences.date);
    searchTerms.push("retreat");
    
    const fullQuery = `(site:bookretreats.com OR site:bookyogaretreats.com) ${searchTerms.join(" ")}`;
    
    console.log("Searching for retreats:", fullQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 20,
      }),
    });

    if (!response.ok) {
      console.log("Search failed:", response.status);
      return [];
    }

    const data = await response.json();
    const results = data.data || [];
    
    console.log("Found", results.length, "search results");

    const retreatPages = results.filter((r: any) => {
      const url = r.url || "";
      return (url.includes("bookretreats.com") || url.includes("bookyogaretreats.com")) &&
             !url.includes("/blog") &&
             !url.includes("/about") &&
             !url.includes("/contact") &&
             !url.includes("/search") && 
             !url.includes("/s/") && 
             !url.includes("?q=");
    });

    console.log("Filtered to", retreatPages.length, "retreat pages");

    if (retreatPages.length === 0) return [];

    // Scrape up to 10 pages to get accurate details
    const scrapedResults: TravelResult[] = [];
    for (let i = 0; i < Math.min(12, retreatPages.length); i++) {
      const result = await scrapeRetreatPage(retreatPages[i].url, FIRECRAWL_API_KEY);
      if (result && result.price > 0 && result.name.length > 5) {
        scrapedResults.push(result);
        if (scrapedResults.length >= 10) break;
      }
    }

    return scrapedResults;
  } catch (error) {
    console.error("Retreat search error:", error);
    return [];
  }
}

// Search and find MULTIPLE holiday matches
async function findBestHolidays(query: string, preferences: any): Promise<TravelResult[]> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return [];

  try {
    const searchTerms: string[] = [];
    if (preferences?.location) searchTerms.push(preferences.location);
    searchTerms.push("holiday vacation package tour");
    if (preferences?.duration) searchTerms.push(`${preferences.duration} day`);
    
    const fullQuery = `(site:viator.com OR site:tripadvisor.com/AttractionProductReview) ${searchTerms.join(" ")}`;
    
    console.log("Searching for holidays:", fullQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 20,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results = data.data || [];
    
    console.log("Found", results.length, "holiday results");

    if (results.length === 0) return [];

    // Scrape up to 10 pages
    const scrapedResults: TravelResult[] = [];
    for (let i = 0; i < Math.min(12, results.length); i++) {
      const result = await scrapeHolidayPage(results[i].url, FIRECRAWL_API_KEY);
      if (result && result.name.length > 5) {
        scrapedResults.push(result);
        if (scrapedResults.length >= 10) break;
      }
    }

    return scrapedResults;
  } catch (error) {
    console.error("Holiday search error:", error);
    return [];
  }
}

function inferTripType(text: string): "holiday" | "retreat" | undefined {
  const lowerText = text.toLowerCase();
  const retreatKeywords = ["retreat", "wellness", "yoga", "meditation", "spa", "detox", "healing", "ayurveda", "silent", "wellbeing", "well-being"];
  const holidayKeywords = ["holiday", "vacation", "tour", "sightseeing", "cruise", "safari", "adventure", "city break", "trip", "escape", "package"];
  if (retreatKeywords.some(keyword => lowerText.includes(keyword))) return "retreat";
  if (holidayKeywords.some(keyword => lowerText.includes(keyword))) return "holiday";
  return undefined;
}

function parseTravelDate(text: string): string | undefined {
  const rangeMatch = text.match(/\b(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+?)\b/i);
  if (rangeMatch) return `${rangeMatch[1].trim()} to ${rangeMatch[2].trim()}`;

  const monthDayMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?\b/i);
  if (monthDayMatch) return monthDayMatch[0];

  const monthYearMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i);
  if (monthYearMatch) return monthYearMatch[0];

  const numericMatch = text.match(/\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/);
  if (numericMatch) return numericMatch[1];

  const relativeMatch = text.match(/\b(next month|this month|next week|this week|later this year|summer|fall|autumn|winter|spring)\b/i);
  if (relativeMatch) return relativeMatch[1];

  const weekdayMatch = text.match(/\b(this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (weekdayMatch) return `${(weekdayMatch[1] || "").trim()} ${weekdayMatch[2]}`.trim();

  const quickMatch = text.match(/\b(today|tomorrow|weekend)\b/i);
  if (quickMatch) return quickMatch[1];

  return undefined;
}

/** Required details before searching: trip type + place + date (budget improves ranking). */
function isPreferencesComplete(preferences: any): boolean {
  return Boolean(
    preferences.tripType &&
    preferences.location &&
    preferences.date,
  );
}

function getNextPreferenceQuestion(preferences: any): string {
  if (!preferences.tripType) {
    return "Are you leaning more toward a retreat (wellness, yoga, that kind of thing) or a classic holiday?";
  }
  if (!preferences.location) {
    return "Nice — where in the world should I look? City, country, or region is perfect.";
  }
  if (!preferences.date) {
    return "Great. What dates or month are you planning for this trip?";
  }
  if (!preferences.budget) {
    return "Great choice. Do you have a rough budget per person so I can narrow this down better?";
  }
  return "Any must-have activities or vibe (for example yoga, spa, beach, adventure), and how many days?";
}

// Extract preferences from conversation
function extractPreferences(messages: any[]): any {
  const allText = messages.filter((m: any) => m.role === "user").map((m: any) => m.content).join(" ");
  const preferences: any = {};
  
  // Budget
  const budgetMatch = allText.match(/\b(?:budget[:\s]*|under\s+|\$)\s*\$?(\d{2,6}(?:,\d{3})?)\b/i)
    || allText.match(/(\d{3,6})\s*(?:usd|dollars)\b/i)
    || allText.match(/(\d{3,6})\s*-\s*\d{3,6}/);
  if (budgetMatch) {
    preferences.budget = budgetMatch[1].replace(/,/g, "");
  }

  // Preferred trip dates
  preferences.date = parseTravelDate(allText);
  
  // Duration
  const durationMatch = allText.match(/(\d+)\s*(day|night|week)/i);
  if (durationMatch) {
    let days = parseInt(durationMatch[1]);
    if (durationMatch[2].toLowerCase() === "week") days *= 7;
    preferences.duration = days.toString();
  }
  
  // Location
  const locations = [
    "thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", 
    "sri lanka", "nepal", "peru", "egypt", "morocco", "indonesia", "vietnam", "cambodia", 
    "usa", "sedona", "hawaii", "california", "rishikesh", "ubud", "koh samui", "phuket", 
    "goa", "maldives", "dubai", "italy", "france", "paris", "rome", "japan", "tokyo", 
    "australia", "sydney", "caribbean", "bahamas", "jamaica", "cancun", "switzerland"
  ];
  for (const loc of locations) {
    if (allText.toLowerCase().includes(loc)) {
      preferences.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }
  
  // Activities
  const activities = [
    "yoga", "meditation", "surf", "wellness", "detox", "spiritual", "adventure", 
    "hiking", "ayurveda", "healing", "silent", "fasting", "pilates", "breathwork",
    "beach", "safari", "cruise", "ski", "romantic", "honeymoon", "family"
  ];
  const foundActivities = activities.filter(act => allText.toLowerCase().includes(act));
  if (foundActivities.length > 0) {
    preferences.activities = foundActivities.join(" ");
  }

  // Accommodation preference (lightweight extraction)
  const accommodation = [
    "private room",
    "shared room",
    "villa",
    "resort",
    "hotel",
    "boutique",
    "eco",
    "glamping",
    "luxury",
  ];
  const foundAcc = accommodation.find((a) => allText.toLowerCase().includes(a));
  if (foundAcc) preferences.accommodation = foundAcc;

  // Dietary requirements (lightweight extraction)
  const dietary = ["vegan", "vegetarian", "gluten free", "halal", "kosher", "dairy free"];
  const foundDiet = dietary.filter((d) => allText.toLowerCase().includes(d));
  if (foundDiet.length) preferences.dietary = foundDiet.join(", ");

  // Group type
  if (/\bsolo\b/i.test(allText)) preferences.groupType = "solo";
  if (/\bcouple|honeymoon\b/i.test(allText)) preferences.groupType = "couple";
  if (/\bfamily|kids?\b/i.test(allText)) preferences.groupType = "family";

  // Trip type
  const tripType = inferTripType(allText);
  if (tripType) {
    preferences.tripType = tripType;
  }

  // Default: if they clearly want a place + retreat cues but never said "holiday", assume retreat
  if (!preferences.tripType && preferences.location) {
    const retreatish = /yoga|meditation|wellness|spa|detox|healing|ayurveda|retreat|silent|breathwork|pilates/i.test(
      allText,
    );
    if (retreatish) preferences.tripType = "retreat";
  }

  console.log("Preferences:", preferences);
  return preferences;
}

// Detect user intent
function scoreMatch(result: TravelResult, preferences: any): number {
  let score = 0;
  const loc = (preferences?.location || "").toLowerCase();
  if (loc) {
    const blob = `${result.location || ""} ${result.country || ""} ${result.name || ""}`.toLowerCase();
    if (blob.includes(loc)) score += 5;
  }
  const prefAct = (preferences?.activities || "").toLowerCase();
  if (prefAct && result.activities?.length) {
    for (const a of result.activities) {
      if (prefAct.includes(String(a).toLowerCase())) score += 2;
    }
  }
  if (preferences?.tripType === "retreat" && result.type === "retreat") score += 1;
  if (preferences?.tripType === "holiday" && result.type === "holiday") score += 1;
  if (preferences?.budget && Number.isFinite(result.price)) {
    const budget = Number(preferences.budget);
    const delta = Math.abs(budget - result.price);
    if (result.price <= budget) {
      score += 4;
      if (delta <= budget * 0.15) score += 2;
    } else if (result.price <= budget * 1.2) {
      score += 1;
    } else {
      score -= 2;
    }
  }
  const hasRealImage =
    Boolean(result.image) &&
    !String(result.image).includes("images.unsplash.com");
  if (hasRealImage) score += 3;
  else score -= 1;
  return score;
}

function detectIntent(message: string): "greeting" | "search" | "question" | "general" | "need_info" {
  const lowerMsg = message.toLowerCase().trim();
  
  const hasLocation = [
    "thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", 
    "sri lanka", "nepal", "peru", "maldives", "dubai", "hawaii", "italy", "france", "japan"
  ].some(loc => lowerMsg.includes(loc));
  
  const hasActivity = [
    "yoga", "meditation", "surf", "wellness", "detox", "spiritual", "adventure", "beach", "safari"
  ].some(act => lowerMsg.includes(act));
  
  const hasSearchIntent = [
    "looking for", "find", "search", "show me", "recommend", "suggest", "want", 
    "need", "book", "interested", "planning", "trip", "travel", "holiday", "vacation", "retreat"
  ].some(s => lowerMsg.includes(s));

  if (hasSearchIntent && (hasLocation || hasActivity || /retreat|holiday|vacation/.test(lowerMsg))) {
    return "search";
  }

  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "hola"];
  if (greetings.some(g => lowerMsg === g || lowerMsg.startsWith(g + " ") || lowerMsg.startsWith(g + ","))) {
    return "greeting";
  }
  
  const generalPatterns = ["weather", "temperature", "time", "date", "how are you", "what can you do", "thank you", "thanks", "bye"];
  if (generalPatterns.some(p => lowerMsg.includes(p))) {
    return "general";
  }

  const questionPatterns = ["what is", "what's", "how does", "can you", "tell me about", "explain"];
  if (questionPatterns.some(q => lowerMsg.startsWith(q))) {
    return "question";
  }
  
  if (hasLocation || hasActivity) {
    return "search";
  }
  
  if (hasSearchIntent) {
    return "need_info";
  }
  
  return "need_info";
}

function buildRateLimitFallbackMessage(
  intent: "greeting" | "search" | "question" | "general" | "need_info",
  shouldSearch: boolean,
  nextQuestion: string | undefined,
  resultCount: number,
): string {
  if (shouldSearch && resultCount > 0) {
    return "I found a real provider match for you below. Pay the 5% concierge fee to get their official booking link.";
  }
  if (!shouldSearch && nextQuestion) {
    return `One sec while I reconnect. ${nextQuestion}`;
  }
  if (intent === "greeting") {
    return "Hey, lovely to chat. Are you thinking retreat or holiday?";
  }
  return "I’m having a quick delay right now, but I’m here. Tell me your ideal destination and trip style, and I’ll narrow it down fast.";
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function getOpenAIModel(): string {
  // Allow override via secrets. Safe default.
  return Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";
}

interface ChatMessageOpenAI {
  role: "system" | "user" | "assistant";
  content: string;
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatMoney(amount: number, currency: string): string {
  if (!Number.isFinite(amount) || amount <= 0) return "Not provided";
  const cur = (currency || "USD").toUpperCase();
  return `${cur} ${Math.round(amount).toLocaleString()}`;
}

function formatActivities(acts: string[]): string {
  const list = (acts || []).filter(Boolean).slice(0, 6);
  if (list.length === 0) return "Not provided";
  return list.join(", ");
}

function premiumSingleMatchMessage(result: TravelResult, preferences: Record<string, unknown>): string {
  const typeLabel = result.type === "holiday" ? "Holiday" : "Retreat";
  const budget = typeof preferences.budget === "string" ? preferences.budget : undefined;
  const date = typeof preferences.date === "string" ? preferences.date : undefined;
  const durationPref = typeof preferences.duration === "string" ? preferences.duration : undefined;
  const activityPref = typeof preferences.activities === "string" ? preferences.activities : undefined;

  const whyBits: string[] = [];
  if (preferences.location) whyBits.push(`it’s in ${String(preferences.location)}`);
  if (budget && Number.isFinite(result.price)) whyBits.push("it’s close to your budget");
  if (activityPref && result.activities?.length) whyBits.push(`it aligns with ${activityPref}`);
  if (durationPref) whyBits.push(`it fits your timing (${durationPref} days)`);
  if (whyBits.length === 0) whyBits.push("it’s the closest match to what you asked for");

  const bestTime = date ? `Based on your dates: ${date}` : "Not provided in listing";
  const bookingLink = result.url ? result.url : "Not provided";

  return `✨ Your Perfect Match

🏝 Retreat/Holiday Name:
${result.name || `${titleCase(result.location || "Destination")} ${typeLabel}`}

📍 Location:
${[result.location, result.country].filter(Boolean).join(", ") || "Not provided"}

💰 Price:
${formatMoney(result.price, result.currency)}

🕒 Duration:
${result.duration || "Not provided"}

🏡 Accommodation:
Not provided in listing

🌟 Main Activities:
${formatActivities(result.activities || [])}

⭐ Rating:
Not provided in listing

💡 Why This Matches You:
${whyBits.join(", ")}.

🌤 Best Time To Visit:
${bestTime}

🔗 Booking Link:
${bookingLink}`.trim();
}

async function completeChatOpenAI(
  apiKey: string,
  messages: ChatMessageOpenAI[],
): Promise<{ content: string; modelUsed: string }> {
  const model = getOpenAIModel();
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  const raw = await res.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error(`OpenAI invalid JSON (${res.status}): ${raw.slice(0, 240)}`);
  }

  if (!res.ok) {
    const errObj = data?.error as { message?: string; type?: string } | undefined;
    const msg = errObj?.message || raw.slice(0, 280);
    if (res.status === 401) {
      throw new Error(`OpenAI authentication failed. Check OPENAI_API_KEY. ${msg}`);
    }
    if (res.status === 429) {
      throw new Error(`OpenAI rate limit reached. ${msg}`);
    }
    throw new Error(`OpenAI error ${res.status}: ${msg}`);
  }

  const choices = data?.choices as Array<{ message?: { content?: string } }> | undefined;
  const content = choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI: empty model response");
  }

  const modelUsed = typeof data?.model === "string" ? data.model : model;
  return { content, modelUsed };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Add it in Supabase: Project Settings → Edge Functions → Secrets (or supabase secrets set OPENAI_API_KEY=...).",
      );
    }

    console.log("Processing chat with", messages.length, "messages");

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";
    
    const intent = detectIntent(userQuery);
    console.log("Intent:", intent, "Query:", userQuery.substring(0, 50));

    let allResults: TravelResult[] = [];
    const preferences = extractPreferences(messages);
    const hasCompletePreferences = isPreferencesComplete(preferences);
    const nextQuestion = hasCompletePreferences ? undefined : getNextPreferenceQuestion(preferences);
    const shouldSearch = hasCompletePreferences;

    const isHolidaySearch = preferences.tripType === "holiday" || 
      userQuery.toLowerCase().includes("holiday") || 
      userQuery.toLowerCase().includes("vacation");
    
    const isRetreatSearch = preferences.tripType === "retreat" || 
      userQuery.toLowerCase().includes("retreat") || 
      userQuery.toLowerCase().includes("yoga") ||
      userQuery.toLowerCase().includes("meditation") ||
      userQuery.toLowerCase().includes("wellness");

    if (shouldSearch) {
      if (isHolidaySearch) {
        allResults = await findBestHolidays(userQuery, preferences);
        console.log("Holiday scrape results:", allResults.length);
      } else if (isRetreatSearch) {
        const curatedResults = await searchCuratedRetreats(preferences);
        const scrapedRetreats = await findBestRetreats(userQuery, preferences);
        allResults = [...curatedResults, ...scrapedRetreats];
        console.log("Retreat results (curated + scraped):", allResults.length);
      } else {
        const curatedResults = await searchCuratedRetreats(preferences);
        const scrapedRetreats = await findBestRetreats(userQuery, preferences);
        allResults = [...curatedResults, ...scrapedRetreats];
        console.log("Default retreat results (curated + scraped):", allResults.length);
      }

      if (allResults.length === 0) {
        const relaxedPreferences = { ...preferences };
        delete relaxedPreferences.budget;
        const relaxedCurated = await searchCuratedRetreats(relaxedPreferences);
        const relaxedScraped = await findBestRetreats(
          preferences.location || userQuery,
          relaxedPreferences,
        );
        allResults = [...relaxedCurated, ...relaxedScraped];
        console.log("Relaxed scrape fallback results:", allResults.length);
      }
    }

    if (allResults.length > 1) {
      allResults = [...allResults].sort(
        (a, b) => scoreMatch(b, preferences) - scoreMatch(a, preferences),
      );
    }

    // Only real providers with an official booking URL
    allResults = allResults.filter((r) => Boolean(r.url?.trim()));

    // Return only the single closest match card once details are complete.
    if (shouldSearch && allResults.length > 0) {
      allResults = [allResults[0]];
    }

    // Build system prompt — Johanna is a concierge matcher and redirection service
    let systemPrompt = `You are Johanna, a warm travel concierge who qualifies travelers and matches them with real retreat and holiday providers. You find listings by searching official vendor sites (e.g. BookRetreats, BookYogaRetreats, Viator, TripAdvisor) — never invent retreats, never show "top 10" lists, and never push paid generic recommendations. Write like a real person: short, natural, warm. No bullet lists, no corporate fluff, no em dashes. Usually 1–2 short sentences. Never say you are an AI.

Business model (always follow):
- Qualify the traveler first (trip type, destination, dates, budget).
- Match them with ONE real provider listing from scraped vendor pages.
- The traveler pays a 5% concierge/redirection fee to unlock the official vendor booking link (fee paid by traveler, not the vendor).
- Final booking always happens directly with the vendor on their official page.
- Never promise vendor-side fees or commissions in this model.

`;

    if (intent === "greeting") {
      systemPrompt += `They just said hi (or similar). Greet back in a human way — you already introduced yourself in the app, so don’t re-introduce. Ask one qualifying question: retreat or holiday, or where they’re dreaming of. One short paragraph max.`;
    } else if (intent === "general") {
      systemPrompt += `Quick, helpful reply. If it’s not about travel, answer briefly and gently steer back to qualifying their trip so you can match them with a real provider.`;
    } else if (intent === "question") {
      systemPrompt += `Answer simply. Mention you match travelers with verified providers and redirect them to book directly with the vendor after a small 5% concierge fee. Then offer to help qualify their trip.`;
    } else if (!shouldSearch) {
      systemPrompt += `You’re still qualifying what they want. Ask ONLY this, in your own casual words (don’t quote it verbatim if it sounds stiff): ${nextQuestion} Keep it to one short message.`;
    } else if (allResults.length > 0) {
      systemPrompt += `You found ONE real provider match from official vendor listings. Do NOT list multiple options. Briefly explain why it fits, mention the 5% concierge fee unlocks the official vendor booking link, and that they book directly with the provider. Keep it to 1–2 short sentences — details appear in the card.`;
    } else {
      systemPrompt += `No real provider matches this round. Say so kindly in one or two short sentences. Do not invent alternatives. Ask one thing to try again (different place, dates, or budget).`;
    }

    const chatMessages: ChatMessageOpenAI[] = [
      { role: "system", content: systemPrompt },
      ...(messages as ChatMessageOpenAI[]),
    ];

    let content: string;

    // When we have a match, keep the message short and show details in the card.
    if (shouldSearch && allResults.length > 0) {
      content =
        "I matched you with a real provider below. Pay the 5% concierge fee to unlock their official booking link — you’ll complete your booking directly with them.";
    } else {
      try {
        const out = await completeChatOpenAI(OPENAI_API_KEY, chatMessages);
        content = out.content;
      } catch (aiErr) {
        const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
        if (msg.toLowerCase().includes("rate limit")) {
          console.warn("Model rate-limited, using local fallback message.");
          content = buildRateLimitFallbackMessage(intent, shouldSearch, nextQuestion, allResults.length);
        } else {
          throw aiErr;
        }
      }
    }

    console.log("Response:", content.substring(0, 50), "Results:", allResults.length);

    return new Response(JSON.stringify({
      content,
      retreats: allResults,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
