import LocationTemplate from "./LocationTemplate";

const Kuwait = () => {
  return (
    <LocationTemplate
      locale="en"
      countryName="Kuwait"
      countrySlug="kuwait"
      intro="Retreats Holidays curates wellness escapes for travelers from Kuwait—yoga retreats, spa holidays, and adventure retreats. Share your preferred dates, duration, and budget to receive tailored recommendations."
      bullets={[
        "Curated wellness and yoga retreats with transparent pricing",
        "Options for solo travelers, friends, and family groups",
        "AI assistant helps shortlist the best matches fast",
      ]}
      faq={[
        {
          q: "Do you offer relaxing spa-focused retreats?",
          a: "Yes—ask for spa and relaxation retreats with gentle activities and comfortable accommodation.",
        },
        {
          q: "Can you recommend retreats for friends traveling together?",
          a: "Absolutely—ask for group-friendly retreats and mention your group size and preferences.",
        },
        {
          q: "How do I start?",
          a: 'Ask the AI: "Wellness retreat, 6 nights, spa + light activities, budget $2000".',
        },
      ]}
    />
  );
};

export default Kuwait;

