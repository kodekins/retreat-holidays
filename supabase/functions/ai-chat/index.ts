import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  const searchText = `${retreat.location} ${retreat.country} ${retreat.activities?.join(" ") || ""}`.toLowerCase();
  
  for (const [key, url] of Object.entries(retreatImages)) {
    if (key !== "default" && searchText.includes(key)) {
      return url;
    }
  }
  return retreatImages.default;
}

// Search for real retreats using Firecrawl
async function searchRealRetreats(query: string, preferences: any): Promise<RetreatResult[]> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!FIRECRAWL_API_KEY) {
    console.log("No Firecrawl API key, using fallback data");
    return [];
  }

  try {
    const searchTerms = [];
    if (preferences?.location) searchTerms.push(preferences.location);
    if (preferences?.activities) searchTerms.push(preferences.activities);
    if (preferences?.budget) searchTerms.push(`under $${preferences.budget}`);
    if (preferences?.duration) searchTerms.push(`${preferences.duration} days`);
    
    const fullQuery = `${query} retreat ${searchTerms.join(" ")} site:bookretreats.com OR site:retreatguru.com OR site:bookyogaretreats.com`;

    console.log("Searching real retreats:", fullQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 8,
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
        },
      }),
    });

    if (!response.ok) {
      console.log("Firecrawl search failed");
      return [];
    }

    const data = await response.json();
    const results = data.data || [];

    console.log("Found", results.length, "real retreat results");
    return results.slice(0, 7).map((result: any, index: number) => parseRetreatFromSearch(result, index, preferences));
  } catch (error) {
    console.error("Error searching retreats:", error);
    return [];
  }
}

function parseRetreatFromSearch(result: any, index: number, preferences: any): RetreatResult {
  const title = result.title || "Retreat Experience";
  const url = result.url || "";
  const content = result.markdown || result.description || "";
  
  // Extract source
  let source = "BookRetreats.com";
  if (url.includes("retreatguru")) source = "RetreatGuru.com";
  else if (url.includes("bookyogaretreats")) source = "BookYogaRetreats.com";
  else if (url.includes("tripadvisor")) source = "TripAdvisor";
  
  // Extract location from title or content
  const locationMatch = content.match(/(?:in|at)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/);
  let location = preferences?.location || "Scenic Location";
  let country = "";
  
  if (locationMatch) {
    const parts = locationMatch[1].split(",").map((p: string) => p.trim());
    location = parts[0] || location;
    country = parts[1] || "";
  }
  
  // Extract price
  const priceMatch = content.match(/\$\s*(\d{2,4})/);
  const price = priceMatch ? parseInt(priceMatch[1]) : 500 + (index * 150);
  
  // Extract duration
  const durationMatch = content.match(/(\d+)\s*(?:day|night)/i);
  const duration = durationMatch ? `${durationMatch[1]} days` : `${5 + index} days`;
  
  // Extract activities
  const activityKeywords = ["yoga", "meditation", "surf", "spa", "wellness", "detox", "hiking", "ayurveda", "massage", "healing"];
  const activities = activityKeywords.filter(act => 
    title.toLowerCase().includes(act) || content.toLowerCase().includes(act)
  ).slice(0, 4);
  
  if (activities.length === 0) {
    activities.push("Yoga", "Meditation", "Wellness");
  }

  const retreat: RetreatResult = {
    id: `search-${index + 1}`,
    name: title.substring(0, 60),
    location,
    country,
    duration,
    price,
    currency: "USD",
    description: result.description || content.substring(0, 150) + "...",
    activities: activities.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
    source,
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
  const budgetMatch = allText.match(/\$?\s*(\d{3,5})\s*(usd|dollars?)?|under\s+\$?(\d+)|max(?:imum)?\s+\$?(\d+)/i);
  if (budgetMatch) {
    preferences.budget = budgetMatch[1] || budgetMatch[3] || budgetMatch[4];
  }
  
  // Duration
  const durationMatch = allText.match(/(\d+)\s*(day|night|week)/i);
  if (durationMatch) {
    preferences.duration = durationMatch[1];
  }
  
  // Location
  const locations = ["thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", "sri lanka", "nepal", "peru", "egypt", "morocco", "indonesia", "vietnam", "cambodia", "usa", "sedona", "hawaii", "california"];
  for (const loc of locations) {
    if (allText.toLowerCase().includes(loc)) {
      preferences.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }
  
  // Activities
  const activities = ["yoga", "meditation", "surf", "wellness", "detox", "spiritual", "adventure", "hiking", "ayurveda", "healing", "silent", "fasting"];
  const foundActivities = activities.filter(act => allText.toLowerCase().includes(act));
  if (foundActivities.length > 0) {
    preferences.activities = foundActivities.join(" ");
  }
  
  return preferences;
}

// Fallback retreats when search fails
function getFallbackRetreats(preferences: any): RetreatResult[] {
  const fallbacks: RetreatResult[] = [
    {
      id: "fallback-1",
      name: "7 Day Wellness Package - Yoga & Meditation",
      location: "Phetchabun",
      country: "Thailand",
      duration: "7 days",
      price: 631,
      currency: "USD",
      description: "A transformative retreat offering daily yoga, guided meditation, temple visits, and healthy Thai cuisine in a serene mountain setting.",
      activities: ["Yoga", "Meditation", "Temple Visits", "Thai Cooking"],
      source: "BookRetreats.com",
      image: retreatImages.thailand,
    },
    {
      id: "fallback-2",
      name: "5 Day Surf & Yoga Adventure",
      location: "Canggu",
      country: "Bali, Indonesia",
      duration: "5 days",
      price: 850,
      currency: "USD",
      description: "Combine surfing thrills with yoga tranquility. Daily surf lessons, morning yoga, organic meals, and Balinese cultural experiences.",
      activities: ["Surfing", "Yoga", "Organic Cuisine", "Cultural Tours"],
      source: "RetreatGuru.com",
      image: retreatImages.bali,
    },
    {
      id: "fallback-3",
      name: "10 Day Spiritual Healing Journey",
      location: "Rishikesh",
      country: "India",
      duration: "10 days",
      price: 499,
      currency: "USD",
      description: "Experience traditional ashram living, daily yoga and meditation, Ayurvedic treatments, and sacred ceremonies by the Ganges.",
      activities: ["Yoga", "Meditation", "Ayurveda", "Sacred Ceremonies"],
      source: "BookYogaRetreats.com",
      image: retreatImages.india,
    },
    {
      id: "fallback-4",
      name: "6 Day Luxury Ocean Wellness",
      location: "Nosara",
      country: "Costa Rica",
      duration: "6 days",
      price: 1200,
      currency: "USD",
      description: "Rejuvenate in tropical paradise with oceanfront yoga, rainforest hiking, spa treatments, and farm-to-table organic cuisine.",
      activities: ["Yoga", "Hiking", "Spa", "Organic Cuisine"],
      source: "BookRetreats.com",
      image: retreatImages["costa rica"],
    },
    {
      id: "fallback-5",
      name: "8 Day Detox & Renewal Retreat",
      location: "Koh Samui",
      country: "Thailand",
      duration: "8 days",
      price: 890,
      currency: "USD",
      description: "Complete mind-body reset with detox programs, yoga, meditation, wellness consultations, and healthy cuisine.",
      activities: ["Detox", "Yoga", "Meditation", "Wellness"],
      source: "RetreatGuru.com",
      image: retreatImages.thailand,
    },
    {
      id: "fallback-6",
      name: "4 Day Mountain Meditation Escape",
      location: "Sedona",
      country: "Arizona, USA",
      duration: "4 days",
      price: 750,
      currency: "USD",
      description: "Connect with nature and yourself through guided meditation, energy vortex tours, sound healing, and desert hiking.",
      activities: ["Meditation", "Sound Healing", "Hiking", "Energy Work"],
      source: "BookRetreats.com",
      image: retreatImages.spiritual,
    },
    {
      id: "fallback-7",
      name: "7 Day Ayurveda Immersion",
      location: "Kerala",
      country: "India",
      duration: "7 days",
      price: 680,
      currency: "USD",
      description: "Authentic Ayurvedic treatments, personalized wellness plans, yoga, meditation, and traditional vegetarian cuisine.",
      activities: ["Ayurveda", "Yoga", "Meditation", "Wellness"],
      source: "BookYogaRetreats.com",
      image: retreatImages.india,
    },
  ];

  // Filter based on preferences if available
  let filtered = [...fallbacks];
  
  if (preferences?.budget) {
    const budget = parseInt(preferences.budget);
    filtered = filtered.filter(r => r.price <= budget);
  }
  
  if (preferences?.location) {
    const loc = preferences.location.toLowerCase();
    const locationFiltered = filtered.filter(r => 
      r.location.toLowerCase().includes(loc) || 
      r.country.toLowerCase().includes(loc)
    );
    if (locationFiltered.length >= 3) {
      filtered = locationFiltered;
    }
  }
  
  // Ensure at least 5 results
  if (filtered.length < 5) {
    filtered = fallbacks.slice(0, 5);
  }
  
  return filtered.slice(0, 7);
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
    console.log("Extracted preferences:", preferences);

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";

    // Search for real retreats
    let retreats = await searchRealRetreats(userQuery, preferences);
    
    // Use fallback if not enough results
    if (retreats.length < 5) {
      console.log("Not enough search results, using fallback retreats");
      retreats = getFallbackRetreats(preferences);
    }

    // Generate AI response
    const retreatContext = retreats.map((r, i) => 
      `${i + 1}. ${r.name} - ${r.location}, ${r.country} - $${r.price} - ${r.duration} - Activities: ${r.activities.join(", ")}`
    ).join("\n");

    const systemPrompt = `You are a friendly retreat booking assistant. Based on the user's preferences, you found these retreat options:

${retreatContext}

IMPORTANT: 
- Keep your response SHORT (2-3 sentences max)
- Just introduce the retreats briefly - the cards will show all details
- Be warm and helpful
- If preferences are unclear, ask ONE clarifying question
- Don't list retreat details - the visual cards will display them`;

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
    const content = data.choices?.[0]?.message?.content || "Here are some great retreat options for you!";
    
    console.log("AI response generated with", retreats.length, "retreats");

    return new Response(JSON.stringify({ 
      content,
      retreats: retreats.slice(0, 5) // Always return at least 5 retreats
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
