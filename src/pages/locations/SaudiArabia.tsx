import LocationTemplate from "./LocationTemplate";

const SaudiArabia = () => {
  return (
    <LocationTemplate
      locale="en"
      countryName="Saudi Arabia"
      countrySlug="saudi-arabia"
      intro="Find wellness, yoga, and adventure retreats curated for travelers from Saudi Arabia. Share your dates, budget, and preferred activities—our AI assistant will shortlist the best options in minutes."
      bullets={[
        "Curated wellness & yoga retreats with clear pricing and inclusions",
        "Options suitable for solo travelers, couples, and groups",
        "Fast discovery via AI chat (destination, dates, duration, budget)",
      ]}
      faq={[
        {
          q: "What’s the best retreat length for travelers from Saudi Arabia?",
          a: "Many guests choose 5–7 nights for a quick reset, or 8–12 nights for deeper wellness + activities. Tell the AI your ideal duration and it will filter options.",
        },
        {
          q: "Can you recommend retreats for friends or family groups?",
          a: "Yes—ask for group-friendly retreats with shared villas, private sessions, and flexible itineraries.",
        },
        {
          q: "How do I shortlist retreats quickly?",
          a: 'Go to the homepage and ask: "yoga retreat, 7 days, beach destination, budget $2000". You’ll get matching suggestions instantly.',
        },
      ]}
    />
  );
};

export default SaudiArabia;

