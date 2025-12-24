import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, preferences } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Search service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query based on user preferences
    const searchTerms = [];
    
    if (preferences?.location) {
      searchTerms.push(preferences.location);
    }
    if (preferences?.activities) {
      searchTerms.push(preferences.activities);
    }
    if (preferences?.budget) {
      searchTerms.push(`under $${preferences.budget}`);
    }
    if (preferences?.duration) {
      searchTerms.push(`${preferences.duration} days`);
    }
    
    const baseQuery = query || "yoga wellness retreat";
    const fullQuery = `${baseQuery} ${searchTerms.join(" ")} site:bookretreats.com OR site:retreatguru.com OR site:bookyogaretreats.com OR site:tripadvisor.com/Attraction`;

    console.log("Searching retreats with query:", fullQuery);

    // Search for retreats using Firecrawl
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fullQuery,
        limit: 10,
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || "Search failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Search successful, found", data.data?.length || 0, "results");

    // Process and format results
    const retreats = (data.data || []).slice(0, 7).map((result: any, index: number) => ({
      id: index + 1,
      title: result.title || "Retreat Option",
      url: result.url,
      description: result.description || "",
      content: result.markdown?.substring(0, 500) || "",
      source: extractSource(result.url),
    }));

    return new Response(
      JSON.stringify({ success: true, retreats }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error searching retreats:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("bookretreats")) return "BookRetreats.com";
    if (hostname.includes("retreatguru")) return "RetreatGuru.com";
    if (hostname.includes("bookyogaretreats")) return "BookYogaRetreats.com";
    if (hostname.includes("tripadvisor")) return "TripAdvisor";
    return hostname;
  } catch {
    return "Unknown";
  }
}
