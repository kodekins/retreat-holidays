import LocationTemplate from "./LocationTemplate";

const Egypt = () => {
  return (
    <LocationTemplate
      locale="en"
      countryName="Egypt"
      countrySlug="egypt"
      intro="Discover wellness and adventure retreats curated for travelers interested in Egypt experiences—from culture to coast. Use our AI assistant to filter by retreat type, duration, and budget."
      bullets={[
        "Yoga, wellness, and adventure retreats with detailed inclusions",
        "Options for beach escapes, cultural journeys, and active holidays",
        "AI assistant helps you shortlist the best matches in minutes",
      ]}
      faq={[
        {
          q: "Do you offer retreats that combine culture and wellness?",
          a: "Yes—ask for cultural + wellness itineraries with gentle activities and curated experiences.",
        },
        {
          q: "Can I find beach-focused wellness escapes?",
          a: "Yes—ask for warm, beach destinations with spa and relaxation inclusions.",
        },
        {
          q: "How do I get recommendations?",
          a: 'Ask the AI: "Egypt wellness retreat, 7 nights, beach + yoga, budget $2000".',
        },
      ]}
    />
  );
};

export default Egypt;

