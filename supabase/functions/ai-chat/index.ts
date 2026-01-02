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

// High-quality images for different types
const travelImages: Record<string, string> = {
  // Locations
  thailand: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  indonesia: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  india: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "costa rica": "https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=800&q=80",
  mexico: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
  portugal: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  spain: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
  greece: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
  "sri lanka": "https://images.unsplash.com/photo-1586613835341-f2be7e67f0b5?w=800&q=80",
  nepal: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  peru: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
  egypt: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80",
  morocco: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
  vietnam: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
  maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  hawaii: "https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=800&q=80",
  italy: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
  france: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  japan: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  australia: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80",
  caribbean: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  switzerland: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
  // Activities
  yoga: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
  meditation: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  surf: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
  wellness: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  detox: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  spiritual: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  adventure: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
  safari: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
  cruise: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80",
  ski: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80",
  city: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80",
  romantic: "https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800&q=80",
  honeymoon: "https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800&q=80",
  family: "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&q=80",
  luxury: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  default: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
};

function getTravelImage(item: any): string {
  const searchText = `${item.location || ""} ${item.country || ""} ${item.activities?.join(" ") || ""} ${item.category || ""} ${item.name || ""}`.toLowerCase();
  
  for (const [key, url] of Object.entries(travelImages)) {
    if (key !== "default" && searchText.includes(key)) {
      return url;
    }
  }
  return travelImages.default;
}

// Search curated retreats from database
async function searchCuratedRetreats(preferences: any): Promise<TravelResult[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) {
    console.log("No Supabase credentials");
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let query = supabase
      .from("curated_retreats")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (preferences?.budget) {
      const budget = parseInt(preferences.budget);
      query = query.lte("price", budget);
    }

    if (preferences?.location) {
      const loc = preferences.location.toLowerCase();
      query = query.or(`location.ilike.%${loc}%,country.ilike.%${loc}%`);
    }

    if (preferences?.activities) {
      const activities = preferences.activities.split(" ");
      for (const activity of activities) {
        query = query.contains("activities", [activity.charAt(0).toUpperCase() + activity.slice(1)]);
      }
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error("Curated retreats error:", error);
      return [];
    }

    console.log("Found", data?.length || 0, "curated retreats");

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
      image: r.image_url || getTravelImage(r),
      category: r.category,
      type: "retreat" as const,
    }));
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Search retreat websites using Firecrawl
async function searchRetreatSites(query: string, preferences: any): Promise<TravelResult[]> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!FIRECRAWL_API_KEY) {
    console.log("No Firecrawl API key");
    return [];
  }

  const results: TravelResult[] = [];

  try {
    // Search both bookretreats.com and bookyogaretreats.com
    const searchTerms = [];
    if (preferences?.location) searchTerms.push(preferences.location);
    if (preferences?.activities) searchTerms.push(preferences.activities);
    searchTerms.push("retreat");
    if (preferences?.duration) searchTerms.push(`${preferences.duration} day`);
    
    const sites = ["bookretreats.com/r/", "bookyogaretreats.com"];
    const siteQuery = sites.map(s => `site:${s}`).join(" OR ");
    const fullQuery = `(${siteQuery}) ${searchTerms.join(" ")}`;

    console.log("Searching retreats:", fullQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 20,
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
        },
      }),
    });

    if (!response.ok) {
      console.log("Firecrawl search failed:", response.status);
      return [];
    }

    const data = await response.json();
    const rawResults = data.data || [];

    console.log("Found", rawResults.length, "raw retreat results");
    
    // Filter to individual retreat pages only
    const retreatPages = rawResults.filter((result: any) => {
      const url = result.url || "";
      // Accept /r/ pages from bookretreats or product pages from bookyogaretreats
      const isRetreatPage = url.includes("/r/") || (url.includes("bookyogaretreats") && !url.includes("/s/") && !url.includes("/search"));
      const isSearchPage = url.includes("/search") || url.includes("/s/") || url.includes("?q=");
      return isRetreatPage && !isSearchPage;
    });

    console.log("Filtered to", retreatPages.length, "retreat pages");

    for (let i = 0; i < Math.min(retreatPages.length, 8); i++) {
      const result = retreatPages[i];
      const parsed = parseRetreatResult(result, i, preferences);
      if (parsed) results.push(parsed);
    }

  } catch (error) {
    console.error("Retreat search error:", error);
  }

  return results;
}

// Search holiday/vacation sites
async function searchHolidaySites(query: string, preferences: any): Promise<TravelResult[]> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!FIRECRAWL_API_KEY) return [];

  const results: TravelResult[] = [];

  try {
    const searchTerms = [];
    if (preferences?.location) searchTerms.push(preferences.location);
    searchTerms.push(preferences?.tripType || "holiday vacation");
    if (preferences?.duration) searchTerms.push(`${preferences.duration} day`);
    
    // Search popular holiday sites
    const fullQuery = `(site:booking.com OR site:tripadvisor.com OR site:viator.com) ${searchTerms.join(" ")} package deal`;

    console.log("Searching holidays:", fullQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 12,
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
        },
      }),
    });

    if (!response.ok) {
      console.log("Holiday search failed:", response.status);
      return [];
    }

    const data = await response.json();
    const rawResults = data.data || [];

    console.log("Found", rawResults.length, "holiday results");

    for (let i = 0; i < Math.min(rawResults.length, 6); i++) {
      const result = rawResults[i];
      const parsed = parseHolidayResult(result, i, preferences);
      if (parsed) results.push(parsed);
    }

  } catch (error) {
    console.error("Holiday search error:", error);
  }

  return results;
}

function parseRetreatResult(result: any, index: number, preferences: any): TravelResult | null {
  const title = result.title || "";
  const url = result.url || "";
  const content = result.markdown || result.description || "";
  
  // Skip if no meaningful content
  if (!title && !content) return null;

  // Extract location
  const locationPatterns = [
    /(?:in|at)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/,
    /Location:\s*([^,\n]+(?:,\s*[^,\n]+)?)/i,
  ];
  
  let location = preferences?.location || "Scenic Location";
  let country = "";
  
  for (const pattern of locationPatterns) {
    const match = content.match(pattern);
    if (match) {
      const parts = match[1].split(",").map((p: string) => p.trim());
      location = parts[0] || location;
      country = parts[1] || "";
      break;
    }
  }
  
  // Extract price
  const pricePatterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*|\d+)/,
    /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:usd|dollars?)/i,
    /from\s*\$?\s*(\d+)/i,
  ];
  
  let price = 500 + (index * 150);
  for (const pattern of pricePatterns) {
    const match = content.match(pattern);
    if (match) {
      price = parseInt(match[1].replace(/,/g, ""));
      break;
    }
  }
  
  // Extract duration
  const durationPatterns = [/(\d+)\s*(?:day|night)/i, /(\d+)\s*Days/];
  let duration = `${5 + (index % 5)} days`;
  for (const pattern of durationPatterns) {
    const match = content.match(pattern);
    if (match) {
      duration = `${match[1]} days`;
      break;
    }
  }
  
  // Extract activities
  const activityKeywords = ["yoga", "meditation", "surf", "spa", "wellness", "detox", "hiking", "ayurveda", "massage", "healing", "pilates", "breathwork", "retreat"];
  const activities = activityKeywords.filter(act => 
    title.toLowerCase().includes(act) || content.toLowerCase().includes(act)
  ).slice(0, 4);
  
  if (activities.length === 0) {
    activities.push("Wellness", "Relaxation");
  }

  // Clean title
  const cleanTitle = title
    .replace(/BookRetreats\.com|BookYogaRetreats\.com/gi, "")
    .replace(/\|.*$/g, "")
    .replace(/-\s*$/, "")
    .trim()
    .substring(0, 60);

  // Determine source
  const source = url.includes("bookyogaretreats") ? "BookYogaRetreats" : "BookRetreats";

  const retreat: TravelResult = {
    id: `retreat-${index + 1}-${Date.now()}`,
    name: cleanTitle || `${activities[0]} Retreat in ${location}`,
    location,
    country,
    duration,
    price,
    currency: "USD",
    description: (result.description || content.substring(0, 200)).replace(/\n/g, " ").trim().substring(0, 180) + "...",
    activities: activities.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
    source,
    url,
    type: "retreat",
  };

  retreat.image = getTravelImage(retreat);
  return retreat;
}

function parseHolidayResult(result: any, index: number, preferences: any): TravelResult | null {
  const title = result.title || "";
  const url = result.url || "";
  const content = result.markdown || result.description || "";
  
  if (!title && !content) return null;

  let location = preferences?.location || "Beautiful Destination";
  let country = "";
  
  // Try to extract location from title or content
  const locationMatch = title.match(/in\s+([A-Z][a-zA-Z\s]+)/i);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }

  // Extract price
  let price = 800 + (index * 200);
  const priceMatch = content.match(/\$\s*(\d{1,3}(?:,\d{3})*|\d+)/);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ""));
  }

  // Extract duration
  let duration = `${4 + (index % 4)} days`;
  const durationMatch = content.match(/(\d+)\s*(?:day|night)/i);
  if (durationMatch) {
    duration = `${durationMatch[1]} days`;
  }

  // Determine activities/highlights
  const holidayKeywords = ["beach", "adventure", "culture", "sightseeing", "tour", "safari", "cruise", "city", "nature", "romance", "luxury", "family"];
  const activities = holidayKeywords.filter(act => 
    title.toLowerCase().includes(act) || content.toLowerCase().includes(act)
  ).slice(0, 4);
  
  if (activities.length === 0) {
    activities.push("Exploration", "Sightseeing");
  }

  const cleanTitle = title
    .replace(/\|.*$/g, "")
    .replace(/-\s*TripAdvisor|-\s*Booking\.com|-\s*Viator/gi, "")
    .trim()
    .substring(0, 60);

  // Determine source
  let source = "Travel Site";
  if (url.includes("tripadvisor")) source = "TripAdvisor";
  else if (url.includes("booking.com")) source = "Booking.com";
  else if (url.includes("viator")) source = "Viator";

  const holiday: TravelResult = {
    id: `holiday-${index + 1}-${Date.now()}`,
    name: cleanTitle || `${location} Holiday Package`,
    location,
    country,
    duration,
    price,
    currency: "USD",
    description: (result.description || content.substring(0, 200)).replace(/\n/g, " ").trim().substring(0, 180) + "...",
    activities: activities.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
    source,
    url,
    type: "holiday",
  };

  holiday.image = getTravelImage(holiday);
  return holiday;
}

// Extract preferences from conversation
function extractPreferences(messages: any[]): any {
  const allText = messages.filter((m: any) => m.role === "user").map((m: any) => m.content).join(" ");
  const preferences: any = {};
  
  // Budget
  const budgetMatch = allText.match(/\$?\s*(\d{3,5})\s*(usd|dollars?)?|under\s+\$?(\d+)|max(?:imum)?\s+\$?(\d+)|budget[:\s]+\$?(\d+)/i);
  if (budgetMatch) {
    preferences.budget = budgetMatch[1] || budgetMatch[3] || budgetMatch[4] || budgetMatch[5];
  }
  
  // Duration
  const durationMatch = allText.match(/(\d+)\s*(day|night|week)/i);
  if (durationMatch) {
    let days = parseInt(durationMatch[1]);
    if (durationMatch[2].toLowerCase() === "week") days *= 7;
    preferences.duration = days.toString();
  }
  
  // Location - expanded list
  const locations = [
    "thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", 
    "sri lanka", "nepal", "peru", "egypt", "morocco", "indonesia", "vietnam", "cambodia", 
    "usa", "sedona", "hawaii", "california", "rishikesh", "ubud", "koh samui", "phuket", 
    "goa", "maldives", "dubai", "italy", "france", "paris", "rome", "japan", "tokyo", 
    "australia", "sydney", "caribbean", "bahamas", "jamaica", "cancun", "switzerland",
    "london", "new york", "miami", "las vegas", "singapore", "hong kong"
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

  // Trip type detection
  if (allText.toLowerCase().includes("holiday") || allText.toLowerCase().includes("vacation")) {
    preferences.tripType = "holiday";
  } else if (allText.toLowerCase().includes("retreat")) {
    preferences.tripType = "retreat";
  } else if (allText.toLowerCase().includes("honeymoon") || allText.toLowerCase().includes("romantic")) {
    preferences.tripType = "honeymoon";
  } else if (allText.toLowerCase().includes("adventure")) {
    preferences.tripType = "adventure";
  }
  
  console.log("Extracted preferences:", preferences);
  return preferences;
}

// Detect user intent
function detectIntent(message: string): "greeting" | "search" | "question" | "general" | "need_info" {
  const lowerMsg = message.toLowerCase().trim();
  
  // Greeting patterns
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "hola", "namaste"];
  if (greetings.some(g => lowerMsg === g || lowerMsg.startsWith(g + " ") || lowerMsg.startsWith(g + ","))) {
    return "greeting";
  }
  
  // General/daily life questions
  const generalPatterns = [
    "weather", "temperature", "forecast", "time", "date", "news", 
    "how are you", "what can you do", "help me", "who are you",
    "thank you", "thanks", "bye", "goodbye", "see you"
  ];
  if (generalPatterns.some(p => lowerMsg.includes(p))) {
    return "general";
  }

  // Check if asking a question
  const questionPatterns = ["what is", "what's", "how does", "can you", "do you", "tell me about", "explain", "what are"];
  if (questionPatterns.some(q => lowerMsg.startsWith(q))) {
    return "question";
  }
  
  // Check for search intent
  const hasLocation = [
    "thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", 
    "sri lanka", "nepal", "peru", "egypt", "morocco", "indonesia", "vietnam", "maldives",
    "dubai", "hawaii", "italy", "france", "japan", "australia", "caribbean", "switzerland"
  ].some(loc => lowerMsg.includes(loc));
  
  const hasActivity = [
    "yoga", "meditation", "surf", "wellness", "detox", "spiritual", "adventure", 
    "hiking", "beach", "safari", "cruise", "ski", "romantic", "honeymoon", "spa"
  ].some(act => lowerMsg.includes(act));
  
  const hasSearchIntent = [
    "looking for", "find", "search", "show me", "recommend", "suggest", "want", 
    "need", "book", "interested", "planning", "trip", "travel", "holiday", "vacation", "retreat"
  ].some(s => lowerMsg.includes(s));
  
  const hasBudget = /\$\d+|budget|under|max/i.test(lowerMsg);
  const hasDuration = /\d+\s*(day|night|week)/i.test(lowerMsg);
  
  // If they have specific criteria, search
  if (hasSearchIntent && (hasLocation || hasActivity || hasBudget || hasDuration)) {
    return "search";
  }
  
  // If just location or activity mentioned
  if (hasLocation || hasActivity) {
    return "search";
  }
  
  // Vague search intent
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

    let finalResults: TravelResult[] = [];
    let sourceText = "";
    
    // Only search for retreats/holidays if intent is search
    if (intent === "search") {
      const preferences = extractPreferences(messages);
      const isHolidaySearch = preferences.tripType === "holiday" || 
        userQuery.toLowerCase().includes("holiday") || 
        userQuery.toLowerCase().includes("vacation") ||
        userQuery.toLowerCase().includes("trip") ||
        userQuery.toLowerCase().includes("travel");
      
      const isRetreatSearch = preferences.tripType === "retreat" || 
        userQuery.toLowerCase().includes("retreat") || 
        userQuery.toLowerCase().includes("yoga") ||
        userQuery.toLowerCase().includes("meditation") ||
        userQuery.toLowerCase().includes("wellness");

      // Search in parallel based on what user wants
      const searchPromises: Promise<TravelResult[]>[] = [];
      
      // Always search curated retreats
      searchPromises.push(searchCuratedRetreats(preferences));
      
      // Search retreats if relevant or if neither is specified
      if (isRetreatSearch || (!isHolidaySearch && !isRetreatSearch)) {
        searchPromises.push(searchRetreatSites(userQuery, preferences));
      } else {
        searchPromises.push(Promise.resolve([]));
      }
      
      // Search holidays if relevant
      if (isHolidaySearch) {
        searchPromises.push(searchHolidaySites(userQuery, preferences));
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      const [curatedRetreats, retreatResults, holidayResults] = await Promise.all(searchPromises);

      console.log("Found:", curatedRetreats.length, "curated,", retreatResults.length, "retreats,", holidayResults.length, "holidays");

      // Combine and deduplicate
      const allResults = [...curatedRetreats, ...retreatResults, ...holidayResults];
      const uniqueResults: TravelResult[] = [];
      const seenNames = new Set<string>();
      
      for (const result of allResults) {
        const normalizedName = result.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seenNames.has(normalizedName)) {
          seenNames.add(normalizedName);
          uniqueResults.push(result);
        }
      }

      finalResults = uniqueResults.slice(0, 6);

      // Build source text
      const sources: string[] = [];
      if (curatedRetreats.length > 0) sources.push("our curated collection");
      if (retreatResults.length > 0) sources.push("BookRetreats & BookYogaRetreats");
      if (holidayResults.length > 0) sources.push("top travel sites");
      sourceText = sources.length > 0 ? `from ${sources.join(" and ")}` : "";
    }

    // Build context for AI
    const resultContext = finalResults.length > 0 ? finalResults.map((r, i) => 
      `${i + 1}. ${r.name} - ${r.location}${r.country ? `, ${r.country}` : ""} - $${r.price} - ${r.duration} - ${r.activities.join(", ")} [${r.source}]`
    ).join("\n") : "";

    // Build comprehensive system prompt
    let systemPrompt = `You are Sarah, a friendly and knowledgeable travel specialist at "Retreats Holidays". You help people find perfect retreats, holidays, and travel experiences.

PERSONALITY:
- Warm, genuine, and conversational - like chatting with a helpful friend
- Empathetic - understand and acknowledge feelings
- Knowledgeable but not pushy
- Use natural language with contractions
- Keep responses concise (2-4 sentences typically)
- Be precise and accurate

CAPABILITIES:
- Find retreats (yoga, meditation, wellness, detox, etc.)
- Find holidays and vacation packages
- Answer general questions about travel, weather, destinations
- Have friendly conversations about anything

`;

    if (intent === "greeting") {
      systemPrompt += `SITUATION: User just greeted you.

RESPONSE: Warmly greet them. Ask what kind of trip they're looking for (retreat or holiday). Max 2 sentences.`;

    } else if (intent === "general") {
      systemPrompt += `SITUATION: User asking a general/daily life question.

RESPONSE: Answer briefly and naturally. Max 2-3 sentences.`;

    } else if (intent === "question") {
      systemPrompt += `SITUATION: User asking an informational question.

RESPONSE: Answer concisely. Max 2-3 sentences.`;

    } else if (intent === "need_info") {
      systemPrompt += `SITUATION: User wants to find something but hasn't given enough details.

RESPONSE: Ask 1 quick question about their destination preference. Keep it to 1-2 sentences.`;

    } else if (intent === "search" && finalResults.length > 0) {
      const resultType = finalResults[0]?.type === "holiday" ? "holiday options" : "retreats";
      systemPrompt += `SITUATION: Found ${finalResults.length} ${resultType} ${sourceText}.

CRITICAL INSTRUCTIONS:
- Say ONLY: "Here are some ${resultType} I found for you! Take a look below 👇"
- Do NOT describe the options - the cards will show all details
- Do NOT mention prices, locations, or durations in text
- Keep response under 15 words
- The cards are displayed automatically below your message`;

    } else if (intent === "search" && finalResults.length === 0) {
      systemPrompt += `SITUATION: Searched but found no exact matches.

RESPONSE: Apologize briefly. Suggest trying a different location or type. Max 2 sentences.`;
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const content = data.choices?.[0]?.message?.content || "I'd love to help you find the perfect travel experience!";
    
    console.log("Response generated with", finalResults.length, "results");

    return new Response(JSON.stringify({ 
      content,
      retreats: finalResults.slice(0, 6)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
