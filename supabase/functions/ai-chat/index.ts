import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to search for real retreats using Firecrawl
async function searchRealRetreats(query: string, preferences: any): Promise<string> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!FIRECRAWL_API_KEY) {
    console.log("No Firecrawl API key, using fallback data");
    return "";
  }

  try {
    // Build search query based on user preferences
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
      console.log("Firecrawl search failed, using fallback");
      return "";
    }

    const data = await response.json();
    const results = data.data || [];

    if (results.length === 0) {
      return "";
    }

    // Format results for AI context
    let formattedResults = "\n\nREAL RETREAT OPTIONS FROM POPULAR PLATFORMS:\n";
    results.slice(0, 7).forEach((result: any, index: number) => {
      const source = extractSource(result.url);
      formattedResults += `\n${index + 1}. ${result.title || "Retreat"}\n`;
      formattedResults += `   Source: ${source}\n`;
      formattedResults += `   URL: ${result.url}\n`;
      if (result.description) {
        formattedResults += `   ${result.description}\n`;
      }
      if (result.markdown) {
        formattedResults += `   Details: ${result.markdown.substring(0, 300)}...\n`;
      }
    });

    console.log("Found", results.length, "real retreat options");
    return formattedResults;
  } catch (error) {
    console.error("Error searching real retreats:", error);
    return "";
  }
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("bookretreats")) return "BookRetreats.com";
    if (hostname.includes("retreatguru")) return "RetreatGuru.com";
    if (hostname.includes("bookyogaretreats")) return "BookYogaRetreats.com";
    if (hostname.includes("tripadvisor")) return "TripAdvisor";
    if (hostname.includes("airbnb")) return "Airbnb Experiences";
    return hostname;
  } catch {
    return "Unknown";
  }
}

// Extract user preferences from message
function extractPreferences(message: string): any {
  const preferences: any = {};
  
  // Extract budget
  const budgetMatch = message.match(/\$?\s*(\d{3,5})\s*(usd|dollars?)?|\bunder\s+\$?(\d+)/i);
  if (budgetMatch) {
    preferences.budget = budgetMatch[1] || budgetMatch[3];
  }
  
  // Extract duration
  const durationMatch = message.match(/(\d+)\s*(day|night|week)/i);
  if (durationMatch) {
    preferences.duration = durationMatch[1];
  }
  
  // Extract location
  const locations = ["thailand", "bali", "india", "costa rica", "mexico", "portugal", "spain", "greece", "sri lanka", "nepal", "peru", "egypt", "morocco", "indonesia", "vietnam", "cambodia", "usa", "europe", "asia"];
  for (const loc of locations) {
    if (message.toLowerCase().includes(loc)) {
      preferences.location = loc;
      break;
    }
  }
  
  // Extract activities
  const activities = ["yoga", "meditation", "surf", "wellness", "detox", "spiritual", "adventure", "hiking", "ayurveda", "healing", "silent", "fasting"];
  const foundActivities = activities.filter(act => message.toLowerCase().includes(act));
  if (foundActivities.length > 0) {
    preferences.activities = foundActivities.join(" ");
  }
  
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

    // Get the latest user message and extract preferences
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";
    
    // Combine all user messages to build complete preference picture
    const allUserMessages = messages
      .filter((m: any) => m.role === "user")
      .map((m: any) => m.content)
      .join(" ");
    
    const preferences = extractPreferences(allUserMessages);
    console.log("Extracted preferences:", preferences);

    // Search for real retreats based on preferences
    let realRetreats = "";
    if (userQuery.length > 3) {
      realRetreats = await searchRealRetreats(userQuery, preferences);
    }

    const systemPrompt = `You are an expert retreat booking assistant for Retreats Holidays. You help users find their PERFECT retreat based on their specific preferences.

YOUR MISSION: Find and recommend EXACTLY what the user wants. Every recommendation must match their stated preferences.

USER'S PREFERENCES FROM THIS CONVERSATION:
${preferences.location ? `- Preferred Location: ${preferences.location}` : "- Location: Not specified yet"}
${preferences.budget ? `- Budget: Under $${preferences.budget}` : "- Budget: Not specified yet"}
${preferences.duration ? `- Duration: ${preferences.duration} days` : "- Duration: Not specified yet"}
${preferences.activities ? `- Activities: ${preferences.activities}` : "- Activities: Not specified yet"}

${realRetreats ? `REAL RETREATS FOUND FROM POPULAR PLATFORMS:${realRetreats}` : ""}

CRITICAL RULES:
1. ALWAYS recommend at least 5 retreat options that MATCH the user's preferences
2. If they specified a location, ALL recommendations must be in or near that location
3. If they specified a budget, ALL recommendations must be within that budget
4. If they specified activities, prioritize retreats offering those activities
5. Include the 5% service fee in all prices you mention
6. For each retreat, provide: Name, Location, Price (with fee), Duration, Key Activities
7. Mention which platform each retreat is from (BookRetreats, RetreatGuru, etc.)
8. Be enthusiastic but focused on their exact needs
9. If preferences are unclear, ask ONE specific clarifying question

FORMAT YOUR RECOMMENDATIONS CLEARLY:
🏝️ **[Retreat Name]** - [Location]
   💰 Price: $X USD (includes 5% service fee)
   📅 Duration: X days
   ✨ Activities: [list key activities]
   📍 Source: [platform name]

Keep responses helpful and focused on finding their perfect match!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request.";
    
    console.log("AI response generated successfully");

    return new Response(JSON.stringify({ content }), {
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
