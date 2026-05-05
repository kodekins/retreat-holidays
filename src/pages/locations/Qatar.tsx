import LocationTemplate from "./LocationTemplate";

const Qatar = () => {
  return (
    <LocationTemplate
      locale="en"
      countryName="Qatar"
      countrySlug="qatar"
      intro="Explore wellness, yoga, and adventure retreats curated for travelers from Qatar. Use our AI assistant to shortlist retreats by destination, dates, activities, and budget—perfect for solo travel, couples, or groups."
      bullets={[
        "Retreats that combine yoga, spa, mindfulness, and outdoor activities",
        "Clear options by budget and duration",
        "Quick shortlisting via AI chat",
      ]}
      faq={[
        {
          q: "Which retreats are best for couples traveling from Qatar?",
          a: "Ask for couples-friendly retreats with private rooms, spa experiences, and flexible schedules.",
        },
        {
          q: "Can I filter retreats by budget and duration?",
          a: "Yes—use the retreats page filters, or tell the AI your maximum budget and ideal duration.",
        },
        {
          q: "What should I ask the AI assistant?",
          a: 'Try: "Yoga + spa retreat, 7 nights, warm destination, budget $2200".',
        },
      ]}
    />
  );
};

export default Qatar;

