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
    searchTerms.push("retreat");
    if (preferences?.activities) searchTerms.push(preferences.activities);
    if (preferences?.duration) searchTerms.push(`${preferences.duration} day`);
    
    // Search bookretreats.com for individual retreat pages (URLs with /r/)
    const fullQuery = `site:bookretreats.com/r/ ${searchTerms.join(" ")}`;

    console.log("Searching BookRetreats.com individual retreats:", fullQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 15,
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
    
    // Filter results to ONLY include individual retreat pages with /r/ in URL
    const retreatPages = results.filter((result: any) => {
      const url = result.url || "";
      
      // ONLY accept URLs with /r/ pattern (individual retreat pages)
      if (!url.includes("/r/")) {
        console.log("Skipping non-retreat URL:", url.substring(0, 60));
        return false;
      }
      
      // Skip search/listing pages
      if (url.includes("/search") || url.includes("/s/") || url.includes("?")) {
        console.log("Skipping search/listing URL:", url.substring(0, 60));
        return false;
      }
      
      return true;
    });

    console.log("Filtered to", retreatPages.length, "individual retreat pages with /r/");

    const parsedRetreats = retreatPages.slice(0, 8).map((result: any, index: number) => 
      parseRetreatFromBookRetreats(result, index, preferences)
    );
    
    console.log("Final retreats:", parsedRetreats.length);
    return parsedRetreats;
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

// Detect user intent from the latest message
function detectIntent(message: string): "greeting" | "search" | "question" | "need_info" {
  const lowerMsg = message.toLowerCase().trim();
  
  // Greeting patterns
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "hola", "namaste", "greetings"];
  if (greetings.some(g => lowerMsg === g || lowerMsg.startsWith(g + " ") || lowerMsg.startsWith(g + ",") || lowerMsg.startsWith(g + "!"))) {
    return "greeting";
  }
  
  // Check if user is asking a question without search intent
  const questionPatterns = ["what is", "what's", "how does", "can you", "do you", "tell me about", "explain"];
  if (questionPatterns.some(q => lowerMsg.startsWith(q))) {
    return "question";
  }
  
  // Check if user provided enough details for a search
  const hasLocation = ["thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", "sri lanka", "nepal", "peru", "egypt", "morocco", "indonesia", "vietnam", "cambodia", "usa", "sedona", "hawaii", "california", "rishikesh", "ubud", "koh samui", "phuket", "goa"].some(loc => lowerMsg.includes(loc));
  const hasActivity = ["yoga", "meditation", "surf", "wellness", "detox", "spiritual", "adventure", "hiking", "ayurveda", "healing", "silent", "fasting", "pilates", "breathwork"].some(act => lowerMsg.includes(act));
  const hasBudget = /\$\d+|budget|under|max/i.test(lowerMsg);
  const hasDuration = /\d+\s*(day|night|week)/i.test(lowerMsg);
  const hasSearchIntent = ["looking for", "find", "search", "show me", "recommend", "suggest", "want", "need", "book", "interested"].some(s => lowerMsg.includes(s));
  
  // If they have search intent AND at least one specific criterion, do search
  if (hasSearchIntent && (hasLocation || hasActivity || hasBudget || hasDuration)) {
    return "search";
  }
  
  // If they just say vague things like "I want a retreat" without details
  if (hasSearchIntent && !hasLocation && !hasActivity && !hasBudget && !hasDuration) {
    return "need_info";
  }
  
  // If they provide specific details even without explicit search words
  if (hasLocation || hasActivity) {
    return "search";
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

    console.log("Processing AI chat request with", messages.length, "messages");

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";
    
    // Detect intent FIRST
    const intent = detectIntent(userQuery);
    console.log("Detected intent:", intent, "for message:", userQuery.substring(0, 50));

    let finalRetreats: RetreatResult[] = [];
    let sourceText = "";
    
    // Only search if intent is "search"
    if (intent === "search") {
      const preferences = extractPreferences(messages);

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

      finalRetreats = uniqueRetreats.slice(0, 7);

      // Determine which sources have results
      const hasCurated = curatedRetreats.length > 0;
      const hasBookRetreats = bookRetreatsResults.length > 0;
      
      if (hasCurated && hasBookRetreats) {
        sourceText = "from our curated collection and BookRetreats.com";
      } else if (hasCurated) {
        sourceText = "from our curated collection";
      } else if (hasBookRetreats) {
        sourceText = "from BookRetreats.com";
      }
    }

    // Build context for retreats only if we searched
    const retreatContext = finalRetreats.length > 0 ? finalRetreats.map((r, i) => 
      `${i + 1}. ${r.name} - ${r.location}, ${r.country} - $${r.price} - ${r.duration} - Activities: ${r.activities.join(", ")} - Source: ${r.source}`
    ).join("\n") : "";

    // Build system prompt based on intent
    let systemPrompt = `You are Sarah, a warm and experienced retreat specialist at "Retreats Holidays". You've personally visited many retreats and genuinely care about helping people find their perfect wellness experience.

YOUR PERSONALITY:
- Friendly, warm, and conversational - like talking to a helpful friend
- Empathetic - acknowledge their feelings and needs
- Knowledgeable but not pushy - you suggest, don't sell aggressively  
- Use casual, natural language (contractions, expressions like "I'd love to help!", "That sounds amazing!")
- Ask thoughtful follow-up questions to understand their needs better

`;

    if (intent === "greeting") {
      systemPrompt += `CURRENT SITUATION: The user just greeted you.

INSTRUCTIONS:
- Warmly greet them back with genuine enthusiasm
- Briefly introduce yourself as their retreat specialist
- Ask what kind of retreat experience they're dreaming of
- Keep it SHORT (2-3 sentences max)
- DO NOT show any retreat results - just have a friendly conversation first
- Ask about: destination preferences, type of experience (yoga, wellness, adventure), budget, duration`;
    } else if (intent === "need_info") {
      systemPrompt += `CURRENT SITUATION: The user wants to find a retreat but hasn't given enough details yet.

INSTRUCTIONS:
- Acknowledge their interest warmly
- Ask 1-2 specific questions to understand what they're looking for
- Questions to consider: Where would they like to go? What type of retreat (yoga, meditation, wellness, adventure)? How long? Any budget in mind?
- Keep it conversational and SHORT (2-3 sentences)
- DO NOT show any retreat results yet - gather info first`;
    } else if (intent === "question") {
      systemPrompt += `CURRENT SITUATION: The user is asking a general question.

INSTRUCTIONS:
- Answer their question helpfully
- If relevant, tie it back to how you can help them find the perfect retreat
- Keep it conversational and SHORT`;
    } else if (intent === "search" && finalRetreats.length > 0) {
      systemPrompt += `CURRENT SITUATION: You searched and found retreat options ${sourceText}.

AVAILABLE RETREATS:
${retreatContext}

INSTRUCTIONS:
- Give a warm, personal intro to the options (1-2 sentences)
- Mention your top pick or best match for them
- Tell them they can click "Book Now" to reserve or "WhatsApp" to learn more
- Keep it SHORT - the retreat cards show all the details`;
    } else if (intent === "search" && finalRetreats.length === 0) {
      systemPrompt += `CURRENT SITUATION: You searched but couldn't find retreats matching their exact criteria.

INSTRUCTIONS:
- Be understanding and supportive
- Suggest adjusting one criterion (different location, dates, or activity type)
- Ask ONE helpful question to find alternatives
- Stay positive and helpful`;
    }

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
