import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RetreatResult {
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
}

// Stock images for different retreat types
const retreatImages: Record<string, string> = {
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
  yoga: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
  meditation: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  surf: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
  wellness: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  detox: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  spiritual: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  default: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
};

function getRetreatImage(retreat: any): string {
  const searchText = `${retreat.location} ${retreat.country} ${retreat.activities?.join(" ") || ""} ${retreat.category || ""}`.toLowerCase();
  
  for (const [key, url] of Object.entries(retreatImages)) {
    if (key !== "default" && searchText.includes(key)) {
      return url;
    }
  }
  return retreatImages.default;
}

// Search curated retreats from our database
async function searchCuratedRetreats(preferences: any): Promise<RetreatResult[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) {
    console.log("No Supabase credentials, skipping curated retreats");
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let query = supabase
      .from("curated_retreats")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    // Apply filters based on preferences
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
      console.error("Error fetching curated retreats:", error);
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
      source: "Retreats Holidays Curated",
      url: r.booking_url,
      image: r.image_url || getRetreatImage(r),
      category: r.category,
    }));
  } catch (error) {
    console.error("Error searching curated retreats:", error);
    return [];
  }
}

// Search BookRetreats.com for retreat listings
async function searchBookRetreats(query: string, preferences: any): Promise<RetreatResult[]> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!FIRECRAWL_API_KEY) {
    console.log("No Firecrawl API key, skipping external search");
    return [];
  }

  try {
    // Build search query with location and preferences
    const searchTerms = [];
    if (preferences?.location) searchTerms.push(preferences.location);
    searchTerms.push("yoga meditation retreat");
    if (preferences?.budget) searchTerms.push(`under $${preferences.budget}`);
    if (preferences?.activities) searchTerms.push(preferences.activities);
    
    // Search bookretreats.com for retreat listings
    const fullQuery = `site:bookretreats.com ${searchTerms.join(" ")}`;

    console.log("Searching BookRetreats.com:", fullQuery);

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
    const results = data.data || [];

    console.log("Found", results.length, "raw results from BookRetreats.com");
    
    // Filter results to find individual retreat pages
    const retreatPages = results.filter((result: any) => {
      const url = result.url || "";
      const title = (result.title || "").toLowerCase();
      const content = result.markdown || result.description || "";
      
      // Skip category/listing pages
      if (/\d+\s*best|\d+\s*top|best\s+\d+|top\s+\d+|compare|browse/i.test(title)) {
        console.log("Skipping listing page:", title.substring(0, 50));
        return false;
      }
      
      // Skip if title starts with a number (e.g., "30 Best Retreats")
      if (/^(the\s+)?\d+\s/i.test(title)) {
        console.log("Skipping numbered listing:", title.substring(0, 50));
        return false;
      }
      
      // Must have price info OR be a specific retreat URL pattern
      const hasPrice = /\$\s*\d{2,}|\d{3,}\s*(usd|dollars?|per\s*person)/i.test(content);
      const hasSpecificUrl = /\/inmotion\/|\/retreat\/[a-z0-9-]+$/i.test(url);
      const hasRetreatName = title.includes("retreat") && !title.includes("retreats in") && !title.includes("retreats for");
      
      return hasPrice || hasSpecificUrl || hasRetreatName;
    });

    console.log("Filtered to", retreatPages.length, "individual retreat pages");

    const parsedRetreats = retreatPages.slice(0, 10).map((result: any, index: number) => 
      parseRetreatFromBookRetreats(result, index, preferences)
    );
    
    // Filter out any that still look like listing pages by name
    const cleanRetreats = parsedRetreats.filter((r: RetreatResult) => {
      const name = r.name.toLowerCase();
      if (/^\d+\s|best\s+\d+|\d+\s+best|top\s+\d+|\d+\s+top/i.test(name)) return false;
      if (name.includes("compare") || name.includes("browse") || name.includes("all retreats")) return false;
      return true;
    });
    
    console.log("Final clean retreats:", cleanRetreats.length);
    return cleanRetreats.slice(0, 8);
  } catch (error) {
    console.error("Error searching BookRetreats.com:", error);
    return [];
  }
}

function parseRetreatFromBookRetreats(result: any, index: number, preferences: any): RetreatResult {
  const title = result.title || "Retreat Experience";
  const url = result.url || "";
  const content = result.markdown || result.description || "";
  
  // Extract location from content
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
  
  // Extract price - look for USD amounts
  const pricePatterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*|\d+)/,
    /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:usd|dollars?)/i,
    /from\s*\$?\s*(\d+)/i,
    /price[:\s]+\$?\s*(\d+)/i,
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
  const durationPatterns = [
    /(\d+)\s*(?:day|night)/i,
    /(\d+)\s*Days/,
  ];
  
  let duration = `${5 + (index % 5)} days`;
  for (const pattern of durationPatterns) {
    const match = content.match(pattern);
    if (match) {
      duration = `${match[1]} days`;
      break;
    }
  }
  
  // Extract activities
  const activityKeywords = ["yoga", "meditation", "surf", "spa", "wellness", "detox", "hiking", "ayurveda", "massage", "healing", "pilates", "breathwork"];
  const activities = activityKeywords.filter(act => 
    title.toLowerCase().includes(act) || content.toLowerCase().includes(act)
  ).slice(0, 4);
  
  if (activities.length === 0) {
    activities.push("Yoga", "Meditation", "Wellness");
  }

  // Clean up title
  let cleanTitle = title
    .replace(/BookRetreats\.com/gi, "")
    .replace(/\|.*$/g, "")
    .replace(/-\s*$/, "")
    .trim()
    .substring(0, 60);

  const retreat: RetreatResult = {
    id: `bookretreats-${index + 1}`,
    name: cleanTitle || `${activities[0]} Retreat in ${location}`,
    location,
    country,
    duration,
    price,
    currency: "USD",
    description: (result.description || content.substring(0, 200)).replace(/\n/g, " ").trim() + "...",
    activities: activities.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
    source: "BookRetreats.com",
    url,
  };

  retreat.image = getRetreatImage(retreat);
  return retreat;
}

// Extract user preferences from conversation
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
  
  // Location
  const locations = ["thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", "sri lanka", "nepal", "peru", "egypt", "morocco", "indonesia", "vietnam", "cambodia", "usa", "sedona", "hawaii", "california", "rishikesh", "ubud", "koh samui", "phuket", "goa"];
  for (const loc of locations) {
    if (allText.toLowerCase().includes(loc)) {
      preferences.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }
  
  // Activities
  const activities = ["yoga", "meditation", "surf", "wellness", "detox", "spiritual", "adventure", "hiking", "ayurveda", "healing", "silent", "fasting", "pilates", "breathwork"];
  const foundActivities = activities.filter(act => allText.toLowerCase().includes(act));
  if (foundActivities.length > 0) {
    preferences.activities = foundActivities.join(" ");
  }
  
  console.log("Extracted preferences:", preferences);
  return preferences;
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

    console.log("Processing AI chat request with", messages.length, "messages");

    const preferences = extractPreferences(messages);

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";

    // Search BOTH curated retreats AND BookRetreats.com in parallel
    const [curatedRetreats, bookRetreatsResults] = await Promise.all([
      searchCuratedRetreats(preferences),
      searchBookRetreats(userQuery, preferences),
    ]);

    console.log("Found", curatedRetreats.length, "curated +", bookRetreatsResults.length, "from BookRetreats.com");

    // Combine results - prioritize curated (featured first), then BookRetreats
    let allRetreats: RetreatResult[] = [
      ...curatedRetreats.filter(r => r.source === "Retreats Holidays Curated"),
      ...bookRetreatsResults,
    ];

    // Remove duplicates by name similarity
    const uniqueRetreats: RetreatResult[] = [];
    const seenNames = new Set<string>();
    
    for (const retreat of allRetreats) {
      const normalizedName = retreat.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueRetreats.push(retreat);
      }
    }

    // Ensure at least 5 results
    let finalRetreats = uniqueRetreats.slice(0, 7);
    
    if (finalRetreats.length < 5) {
      console.log("Not enough results, need more from external search");
    }

    // Determine which sources have results
    const hasCurated = curatedRetreats.length > 0;
    const hasBookRetreats = bookRetreatsResults.length > 0;
    
    let sourceText = "";
    if (hasCurated && hasBookRetreats) {
      sourceText = "from our curated collection and BookRetreats.com";
    } else if (hasCurated) {
      sourceText = "from our curated collection";
    } else if (hasBookRetreats) {
      sourceText = "from BookRetreats.com";
    }

    // Generate AI response
    const retreatContext = finalRetreats.map((r, i) => 
      `${i + 1}. ${r.name} - ${r.location}, ${r.country} - $${r.price} - ${r.duration} - Activities: ${r.activities.join(", ")} - Source: ${r.source}`
    ).join("\n");

    const systemPrompt = `You are a friendly retreat booking assistant for "Retreats Holidays". You help users find wellness retreats.

${finalRetreats.length > 0 ? `Based on the user's preferences, you found these retreat options ${sourceText}:

${retreatContext}

IMPORTANT INSTRUCTIONS:
- Keep your response SHORT (2-3 sentences max)
- Just introduce the retreats briefly - visual cards will show all details
- Be warm, helpful, and enthusiastic
- Don't repeat retreat details that will be shown in cards` : `You couldn't find any retreats matching the user's exact criteria.

IMPORTANT INSTRUCTIONS:
- Apologize briefly and ask the user to try different criteria
- Suggest they try a different location, adjust their budget, or be more flexible with dates
- Ask ONE clarifying question to help narrow down their preferences
- Do NOT mention "curated collection" or "BookRetreats.com" since no results were found`}`;

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
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const content = data.choices?.[0]?.message?.content || "Here are some great retreat options I found for you!";
    
    console.log("AI response generated with", finalRetreats.length, "retreats");

    return new Response(JSON.stringify({ 
      content,
      retreats: finalRetreats.slice(0, 5) // Return at least 5 retreats
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
