import LocationTemplate from "./LocationTemplate";

const Uae = () => {
  return (
    <LocationTemplate
      locale="en"
      countryName="UAE (Dubai)"
      countrySlug="uae"
      intro="Looking for a wellness escape from the UAE? Retreats Holidays curates yoga, spa, and adventure retreats for travelers from Dubai and across the Emirates. Tell our AI assistant your dates, budget, and preferred vibe to get matched quickly."
      bullets={[
        "Hand-picked retreats with wellness, yoga, spa, and adventure options",
        "Short breaks (3–5 nights) and longer resets (7–12 nights)",
        "AI-powered recommendations tailored to your preferences",
      ]}
      faq={[
        {
          q: "Do you have retreats suitable for a short Dubai getaway?",
          a: "Yes—many guests pick 3–5 nights for a quick reset. Ask the AI for short-duration retreats and it will filter immediately.",
        },
        {
          q: "Can you recommend luxury wellness retreats?",
          a: "Yes—ask for luxury or premium options with private accommodation, spa inclusions, and curated activities.",
        },
        {
          q: "How do I get the best recommendations fast?",
          a: 'Ask the AI: "Wellness retreat, 5 nights, spa + yoga, budget $2500, beach destination".',
        },
      ]}
    />
  );
};

export default Uae;

