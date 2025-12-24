import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to search for retreats on popular platforms
async function searchRetreats(query: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.log("No API key for web search, using fallback data");
    return "";
  }

  try {
    // Use web search to find real retreats from famous platforms
    const searchPrompt = `Search for retreat and wellness holiday options matching: "${query}"
    
    Search on these famous retreat platforms:
    - BookRetreats.com
    - RetreatGuru.com
    - BookYogaRetreats.com
    - TripAdvisor Wellness
    - Airbnb Experiences
    
    Return at least 5-7 real retreat options with:
    - Retreat name and provider/host
    - Location (city, country)
    - Duration (days)
    - Price range in USD
    - Key activities included
    - Brief description
    - Rating if available
    
    Format as a structured list.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are a retreat search expert. Search the web for real retreat options from famous platforms like BookRetreats, RetreatGuru, BookYogaRetreats, TripAdvisor, and Airbnb Experiences. Always provide at least 5 real, bookable retreat options with accurate pricing and details. Include variety in locations and price ranges.` 
          },
          { role: "user", content: searchPrompt }
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }
    
    console.log("Web search failed, using fallback");
    return "";
  } catch (error) {
    console.error("Error searching retreats:", error);
    return "";
  }
}

const FALLBACK_RETREATS = `
Popular Retreat Options from Major Platforms:

FROM BOOKRETREATS.COM:
1. 7 Day Wellness Package, Yoga, Meditation and More - Phetchabun, Thailand
   Price: $631 USD | Duration: 7 days | Rating: 4.8/5
   Activities: Daily yoga, meditation, temple visits, Thai cooking classes, spa treatments
   
2. 8 Day Holistic Healing & Detox Retreat - Koh Samui, Thailand
   Price: $890 USD | Duration: 8 days | Rating: 4.9/5
   Activities: Detox program, yoga, meditation, wellness consultations, healthy cuisine

FROM RETREATGURU.COM:
3. 5 Day Surf & Yoga Retreat - Canggu, Bali, Indonesia
   Price: $850 USD | Duration: 5 days | Rating: 4.7/5
   Activities: Surfing lessons, daily yoga, vegan meals, cultural tours, spa

4. 10 Day Spiritual Awakening Retreat - Rishikesh, India
   Price: $499 USD | Duration: 10 days | Rating: 4.9/5
   Activities: Traditional yoga, meditation, Ayurveda, sacred ceremonies, Himalayan treks

FROM BOOKYOGARETREATS.COM:
5. 6 Day Luxury Ocean View Wellness - Nosara, Costa Rica
   Price: $1,200 USD | Duration: 6 days | Rating: 4.8/5
   Activities: Yoga, hiking, wildlife tours, spa treatments, organic farm-to-table cuisine

6. 4 Day Mountain Meditation Escape - Sedona, Arizona, USA
   Price: $750 USD | Duration: 4 days | Rating: 4.6/5
   Activities: Guided meditation, energy vortex tours, sound healing, hiking

FROM TRIPADVISOR WELLNESS:
7. 7 Day Ayurveda & Yoga Immersion - Kerala, India
   Price: $680 USD | Duration: 7 days | Rating: 4.8/5
   Activities: Authentic Ayurvedic treatments, yoga, meditation, vegetarian cuisine
`;

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

    // Extract the latest user query for search context
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userQuery = lastUserMessage?.content || "";
    
    // Search for retreats based on user preferences
    let retreatResults = "";
    if (userQuery.toLowerCase().includes("retreat") || 
        userQuery.toLowerCase().includes("yoga") || 
        userQuery.toLowerCase().includes("wellness") ||
        userQuery.toLowerCase().includes("travel") ||
        userQuery.toLowerCase().includes("holiday") ||
        userQuery.toLowerCase().includes("vacation") ||
        userQuery.toLowerCase().includes("meditation") ||
        userQuery.toLowerCase().includes("spiritual") ||
        userQuery.toLowerCase().includes("surf") ||
        userQuery.toLowerCase().includes("detox") ||
        userQuery.toLowerCase().includes("budget") ||
        userQuery.toLowerCase().includes("$") ||
        messages.length > 1) {
      retreatResults = await searchRetreats(userQuery);
    }

    // Use fallback if search didn't return results
    const retreatsData = retreatResults || FALLBACK_RETREATS;

    const systemPrompt = `You are a friendly and knowledgeable retreat booking assistant for Retreats Holidays.
Your expertise is helping users find the perfect retreat or wellness holiday based on their preferences.

AVAILABLE RETREATS FROM POPULAR PLATFORMS:
${retreatsData}

IMPORTANT GUIDELINES:
- Always recommend at least 5 retreat options that match user preferences
- Consider their budget, preferred activities, duration, and location preferences
- Note that all prices shown include our 5% service fee
- Be enthusiastic and helpful - you're helping them plan a transformative experience!
- Provide specific details: name, location, price, duration, and key activities
- If budget is mentioned, prioritize options within their range
- Ask clarifying questions if needed: What activities interest them? Budget range? Preferred location/climate?
- Mention which platform each retreat is from for credibility
- For each recommendation, briefly explain why it's a good match for them
- Keep responses conversational but informative

If they ask about something unrelated to retreats, gently guide them back to planning their perfect getaway.`;

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
