import LocationTemplate from "./LocationTemplate";

const Oman = () => {
  return (
    <LocationTemplate
      locale="en"
      countryName="Oman"
      countrySlug="oman"
      intro="Find hand-picked wellness, yoga, and adventure retreats curated for travelers from Oman. Tell our AI assistant your ideal travel dates, retreat style, and budget to get matched quickly."
      bullets={[
        "Wellness escapes combining yoga, mindfulness, spa, and nature",
        "Flexible options for different budgets and durations",
        "Fast AI shortlisting for personalized recommendations",
      ]}
      faq={[
        {
          q: "Do you have retreats focused on nature and calm?",
          a: "Yes—ask for nature-focused retreats with quiet locations, gentle wellness, and scenic experiences.",
        },
        {
          q: "Can I get adventure + wellness together?",
          a: "Yes—ask for adventure retreats that combine wellness with activities like water sports, hiking, or cultural excursions.",
        },
        {
          q: "What’s the quickest way to choose?",
          a: 'Ask the AI: "Nature wellness retreat, 7 nights, quiet location, budget $2300".',
        },
      ]}
    />
  );
};

export default Oman;

