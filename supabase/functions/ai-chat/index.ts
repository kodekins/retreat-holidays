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

// Search curated retreats from database
async function searchCuratedRetreats(preferences: any): Promise<TravelResult[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let query = supabase
      .from("curated_retreats")
      .select("*")
      .order("featured", { ascending: false });

    if (preferences?.budget) {
      query = query.lte("price", parseInt(preferences.budget));
    }
    if (preferences?.location) {
      const loc = preferences.location.toLowerCase();
      query = query.or(`location.ilike.%${loc}%,country.ilike.%${loc}%`);
    }

    const { data, error } = await query.limit(5);

    if (error) {
      console.error("Curated retreats error:", error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      location: r.location,
      country: r.country,
      duration: r.duration,
      price: Number(r.price),
      currency: r.currency || "USD",
      description: r.description,
      activities: r.activities || [],
      source: "Curated Collection",
      url: r.booking_url,
      image: r.image_url || getFallbackImage(r),
      category: r.category,
      type: "retreat" as const,
    }));
  } catch (error) {
    console.error("Curated search error:", error);
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

// Search and find the BEST retreat match
async function findBestRetreat(query: string, preferences: any): Promise<TravelResult | null> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return null;

  try {
    // Build targeted search query
    const searchTerms = [];
    if (preferences?.location) searchTerms.push(preferences.location);
    if (preferences?.activities) searchTerms.push(preferences.activities);
    if (preferences?.duration) searchTerms.push(`${preferences.duration} day`);
    searchTerms.push("retreat");
    
    // Search specifically on retreat pages
    const fullQuery = `(site:bookretreats.com/r/ OR site:bookyogaretreats.com) ${searchTerms.join(" ")}`;
    
    console.log("Searching for retreats:", fullQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 10,
      }),
    });

    if (!response.ok) {
      console.log("Search failed:", response.status);
      return null;
    }

    const data = await response.json();
    const results = data.data || [];
    
    console.log("Found", results.length, "search results");

    // Filter to individual retreat pages only
    const retreatPages = results.filter((r: any) => {
      const url = r.url || "";
      return (url.includes("/r/") || url.includes("bookyogaretreats.com")) && 
             !url.includes("/search") && 
             !url.includes("/s/") && 
             !url.includes("?q=");
    });

    console.log("Filtered to", retreatPages.length, "retreat pages");

    if (retreatPages.length === 0) return null;

    // Scrape the BEST matching page to get accurate details
    // Try first 3 results to find one with good data
    for (let i = 0; i < Math.min(3, retreatPages.length); i++) {
      const result = await scrapeRetreatPage(retreatPages[i].url, FIRECRAWL_API_KEY);
      if (result && result.price > 0 && result.name.length > 5) {
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error("Retreat search error:", error);
    return null;
  }
}

// Search and find the BEST holiday match
async function findBestHoliday(query: string, preferences: any): Promise<TravelResult | null> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return null;

  try {
    const searchTerms = [];
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
        limit: 8,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.data || [];
    
    console.log("Found", results.length, "holiday results");

    if (results.length === 0) return null;

    // Scrape the best matching page
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const result = await scrapeHolidayPage(results[i].url, FIRECRAWL_API_KEY);
      if (result && result.name.length > 5) {
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error("Holiday search error:", error);
    return null;
  }
}

// Extract preferences from conversation
function extractPreferences(messages: any[]): any {
  const allText = messages.filter((m: any) => m.role === "user").map((m: any) => m.content).join(" ");
  const preferences: any = {};
  
  // Budget
  const budgetMatch = allText.match(/\$?\s*(\d{3,5})\s*(usd|dollars?)?|under\s+\$?(\d+)|budget[:\s]+\$?(\d+)/i);
  if (budgetMatch) {
    preferences.budget = budgetMatch[1] || budgetMatch[3] || budgetMatch[4];
  }
  
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

  // Trip type
  if (allText.toLowerCase().includes("holiday") || allText.toLowerCase().includes("vacation")) {
    preferences.tripType = "holiday";
  } else if (allText.toLowerCase().includes("retreat")) {
    preferences.tripType = "retreat";
  }
  
  console.log("Preferences:", preferences);
  return preferences;
}

// Detect user intent
function detectIntent(message: string): "greeting" | "search" | "question" | "general" | "need_info" {
  const lowerMsg = message.toLowerCase().trim();
  
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
  
  if (hasSearchIntent && (hasLocation || hasActivity)) {
    return "search";
  }
  
  if (hasLocation || hasActivity) {
    return "search";
  }
  
  if (hasSearchIntent) {
    return "need_info";
  }
  
  return "need_info";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat with", messages.length, "messages");

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";
    
    const intent = detectIntent(userQuery);
    console.log("Intent:", intent, "Query:", userQuery.substring(0, 50));

    let bestResult: TravelResult | null = null;
    
    // Only search if intent is search
    if (intent === "search") {
      const preferences = extractPreferences(messages);
      
      const isHolidaySearch = preferences.tripType === "holiday" || 
        userQuery.toLowerCase().includes("holiday") || 
        userQuery.toLowerCase().includes("vacation");
      
      const isRetreatSearch = preferences.tripType === "retreat" || 
        userQuery.toLowerCase().includes("retreat") || 
        userQuery.toLowerCase().includes("yoga") ||
        userQuery.toLowerCase().includes("meditation") ||
        userQuery.toLowerCase().includes("wellness");

      // First check curated retreats
      const curatedResults = await searchCuratedRetreats(preferences);
      
      if (curatedResults.length > 0 && !isHolidaySearch) {
        // Return best curated match
        bestResult = curatedResults[0];
        console.log("Using curated result:", bestResult.name);
      } else if (isHolidaySearch) {
        // Search for holidays
        bestResult = await findBestHoliday(userQuery, preferences);
        console.log("Holiday search result:", bestResult?.name || "none");
      } else if (isRetreatSearch || !bestResult) {
        // Search for retreats
        bestResult = await findBestRetreat(userQuery, preferences);
        console.log("Retreat search result:", bestResult?.name || "none");
      }
    }

    // Build system prompt
    let systemPrompt = `You are Sarah, a friendly travel specialist. Keep responses SHORT and natural (1-2 sentences max).

`;

    if (intent === "greeting") {
      systemPrompt += `User just greeted you. Warmly greet back and ask what kind of trip they want (retreat or holiday). Max 2 sentences.`;
    } else if (intent === "general") {
      systemPrompt += `User asking a general question. Answer briefly and naturally. Max 2 sentences.`;
    } else if (intent === "question") {
      systemPrompt += `User asking an informational question. Answer concisely. Max 2 sentences.`;
    } else if (intent === "need_info") {
      systemPrompt += `User wants to find something but needs guidance. Ask about their preferred destination or type of experience. Max 1-2 sentences.`;
    } else if (intent === "search" && bestResult) {
      systemPrompt += `Found a perfect match! Say ONLY: "I found the perfect option for you! 👇" - nothing else. The card below shows all details.`;
    } else if (intent === "search" && !bestResult) {
      systemPrompt += `Couldn't find exact matches. Apologize briefly and ask if they'd like to try a different destination or activity type. Max 2 sentences.`;
    }

    // Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const content = data.choices?.[0]?.message?.content || "I'd love to help you find the perfect experience!";
    
    console.log("Response:", content.substring(0, 50), "Result:", bestResult?.name || "none");

    return new Response(JSON.stringify({ 
      content,
      retreats: bestResult ? [bestResult] : []
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
