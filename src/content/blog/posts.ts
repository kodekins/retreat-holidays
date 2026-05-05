export type BlogPost = {
  slug: string;
  lang: "en" | "ar";
  title: string;
  description: string;
  keywords: string;
  country?: "Saudi Arabia" | "UAE" | "Qatar" | "Kuwait" | "Oman" | "Egypt" | "GCC";
  publishedAt: string; // ISO
  bodyHtml: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "wellness-retreat-saudi-arabia",
    lang: "en",
    title: "Wellness Retreats for Saudi Travelers (2026 Guide)",
    description:
      "A practical guide for travelers from Saudi Arabia to choose the right wellness or yoga retreat by duration, budget, and retreat style.",
    keywords:
      "wellness retreat saudi arabia, yoga retreat from saudi, wellness holiday riyadh, jeddah wellness retreats",
    country: "Saudi Arabia",
    publishedAt: "2026-05-05",
    bodyHtml: `
      <p>Travelers from Saudi Arabia often look for a fast reset: quality accommodation, wellness sessions, and a clear itinerary. Here’s how to pick the right retreat quickly.</p>
      <h2>1) Choose your retreat style</h2>
      <ul>
        <li><strong>Yoga + mindfulness</strong> for stress relief and sleep reset</li>
        <li><strong>Spa + relaxation</strong> for deep recovery</li>
        <li><strong>Adventure + wellness</strong> for an active holiday that still feels restorative</li>
      </ul>
      <h2>2) Pick the ideal duration</h2>
      <ul>
        <li><strong>3–5 nights</strong>: quick refresh</li>
        <li><strong>6–8 nights</strong>: best balance of wellness + activities</li>
        <li><strong>9–12 nights</strong>: deeper transformation</li>
      </ul>
      <h2>3) Ask for a shortlist (fast)</h2>
      <p>On the homepage, ask our AI assistant: <em>“Yoga retreat, 7 nights, beach destination, budget $2000”</em>.</p>
      <p>Then compare inclusions (meals, sessions, transfers) before you book.</p>
    `,
  },
  {
    slug: "dubai-uae-yoga-retreats",
    lang: "en",
    title: "Dubai & UAE: How to Choose a Yoga or Spa Retreat",
    description:
      "For UAE travelers, here’s a simple framework to pick a yoga, spa, or wellness retreat by vibe, duration, and budget.",
    keywords:
      "dubai wellness retreats, uae yoga retreat, spa retreat for dubai travelers, luxury wellness holidays uae",
    country: "UAE",
    publishedAt: "2026-05-05",
    bodyHtml: `
      <p>If you’re traveling from Dubai or anywhere in the UAE, your biggest advantage is flexibility—many retreats work as short breaks or longer resets.</p>
      <h2>Short break vs longer reset</h2>
      <ul>
        <li><strong>3–5 nights</strong>: spa + relaxation, light activities</li>
        <li><strong>7–10 nights</strong>: yoga progression + deeper wellness</li>
      </ul>
      <h2>What to look for</h2>
      <ul>
        <li>Clear inclusions (sessions, meals, accommodation)</li>
        <li>Comfort level (standard vs premium)</li>
        <li>Activity intensity (gentle vs active)</li>
      </ul>
      <p>Try asking the AI: <em>“Wellness retreat, 5 nights, spa + yoga, budget $2500, warm destination”</em>.</p>
    `,
  },
  {
    slug: "qatar-kuwait-oman-retreat-planning",
    lang: "en",
    title: "Qatar, Kuwait, Oman: Planning a Wellness Retreat (Checklist)",
    description:
      "A simple checklist for travelers from Qatar, Kuwait, and Oman to plan a retreat: timing, budget, and best retreat styles.",
    keywords:
      "qatar wellness retreat, kuwait wellness retreat, oman yoga retreat, spa retreat gulf travelers",
    country: "GCC",
    publishedAt: "2026-05-05",
    bodyHtml: `
      <p>For travelers across Qatar, Kuwait, and Oman, the best retreats are the ones that match your schedule and energy level.</p>
      <h2>Planning checklist</h2>
      <ul>
        <li><strong>Dates</strong>: fixed or flexible?</li>
        <li><strong>Budget</strong>: max spend per person</li>
        <li><strong>Activities</strong>: yoga, spa, water sports, hiking, culture</li>
        <li><strong>Room type</strong>: private vs shared</li>
      </ul>
      <h2>Best questions to ask the AI</h2>
      <ul>
        <li><em>“Quiet nature wellness retreat, 7 nights, budget $2300”</em></li>
        <li><em>“Group-friendly spa retreat, 5 nights, light activities”</em></li>
      </ul>
    `,
  },
  {
    slug: "egypt-wellness-retreats-guide",
    lang: "en",
    title: "Egypt Wellness Retreats: Beach, Culture, and Reset (2026)",
    description:
      "How to pick an Egypt wellness retreat by goal: beach relaxation, cultural exploration, or yoga + mindfulness reset.",
    keywords:
      "egypt wellness retreats, egypt yoga retreat, red sea wellness holiday, egypt wellness travel 2026",
    country: "Egypt",
    publishedAt: "2026-05-05",
    bodyHtml: `
      <p>Egypt can deliver a unique wellness experience: coastal relaxation, cultural exploration, and outdoor adventure.</p>
      <h2>Pick your goal</h2>
      <ul>
        <li><strong>Beach reset</strong>: spa + gentle wellness</li>
        <li><strong>Culture + wellbeing</strong>: curated experiences + recovery time</li>
        <li><strong>Yoga + mindfulness</strong>: focused practice and sleep reset</li>
      </ul>
      <p>Ask the AI: <em>“Egypt wellness retreat, 7 nights, beach + yoga, budget $2000”</em>.</p>
    `,
  },
];

export const getBlogPost = (slug: string) =>
  blogPosts.find((p) => p.slug === slug && p.lang === "en");

