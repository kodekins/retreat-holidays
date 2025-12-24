import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RETREATS_DATA = `
Available Retreats from Top Platforms (BookRetreats, Retreat Guru, BookYogaRetreats):

1. 7 Day Wellness Package, Yoga, Meditation and More - Phetchabun, Thailand - $631 USD - 7 days
   Activities: Yoga, Meditation, Temple Visits, Thai Cuisine, Cooking Classes
   Category: Wellness | Rating: 4.9/5 | Source: BookRetreats
   
2. 5 Day Surf & Yoga Retreat - Ubud, Bali, Indonesia - $850 USD - 5 days
   Activities: Surfing, Yoga, Vegan Food, Cultural Tours, Spa Treatments
   Category: Surf | Rating: 4.8/5 | Source: Retreat Guru
   
3. 10 Day Spiritual Healing Retreat - Rishikesh, India - $499 USD - 10 days
   Activities: Yoga, Meditation, Ayurveda, Sacred Ceremonies, Himalayan Treks
   Category: Spiritual | Rating: 4.7/5 | Source: BookYogaRetreats
   
4. 6 Day Ocean View Yoga & Wellness - Guanacaste, Costa Rica - $1200 USD - 6 days
   Activities: Yoga, Hiking, Wildlife, Spa, Organic Cuisine
   Category: Wellness | Rating: 4.9/5 | Source: BookRetreats

5. 8 Day Detox & Cleanse Retreat - Koh Samui, Thailand - $1450 USD - 8 days
   Activities: Detox Programs, Colonics, Yoga, Raw Food, Beach Activities
   Category: Detox | Rating: 4.6/5 | Source: Retreat Guru

6. 14 Day 200-Hour Yoga Teacher Training - Goa, India - $1299 USD - 14 days
   Activities: Yoga Teacher Training, Meditation, Philosophy, Anatomy, Practicum
   Category: Teacher Training | Rating: 4.8/5 | Source: BookYogaRetreats

7. 5 Day Silent Meditation Retreat - Sedona, Arizona, USA - $890 USD - 5 days
   Activities: Vipassana Meditation, Nature Walks, Journaling, Sound Healing
   Category: Meditation | Rating: 4.9/5 | Source: Insight Timer Retreats

8. 7 Day Ayurveda Panchakarma Retreat - Kerala, India - $750 USD - 7 days
   Activities: Ayurvedic Treatments, Yoga, Meditation, Herbal Medicines, Massage
   Category: Ayurveda | Rating: 4.7/5 | Source: BookRetreats

9. 4 Day Weekend Wellness Escape - Tuscany, Italy - $680 USD - 4 days
   Activities: Yoga, Wine Tasting, Cooking Classes, Spa, Nature Hikes
   Category: Wellness | Rating: 4.8/5 | Source: Retreat Guru

10. 6 Day Adventure & Yoga Retreat - Nosara, Costa Rica - $1100 USD - 6 days
    Activities: Yoga, Surfing, Zip-lining, Waterfall Tours, Beach Meditation
    Category: Adventure | Rating: 4.9/5 | Source: BookYogaRetreats

11. 21 Day Intensive Meditation & Mindfulness - Dharamsala, India - $899 USD - 21 days
    Activities: Buddhist Meditation, Tibetan Culture, Mountain Treks, Philosophy
    Category: Meditation | Rating: 4.6/5 | Source: Retreat Guru

12. 5 Day Luxury Spa & Yoga Retreat - Maldives - $2500 USD - 5 days
    Activities: Private Yoga, Spa Treatments, Snorkeling, Sunset Cruises, Gourmet Dining
    Category: Luxury | Rating: 5.0/5 | Source: BookRetreats
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

    const systemPrompt = `You are a friendly and helpful retreat booking assistant for Retreats Holidays. 
Your job is to help users find the perfect retreat based on their preferences.

${RETREATS_DATA}

Guidelines:
- Be warm, friendly, and enthusiastic about helping users find their perfect retreat
- Ask clarifying questions about their preferences (budget, activities, duration, location)
- Recommend retreats based on their interests
- Note that prices shown include a 5% service fee
- Always mention retreat names, locations, and prices when recommending
- Keep responses concise but helpful
- If they ask about something not related to retreats, politely redirect the conversation`;

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
