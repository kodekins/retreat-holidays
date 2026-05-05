import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://retreats-holidays.com";
const SITE_NAME = "Retreats Holidays";
const DEFAULT_IMAGE = `${SITE_URL}/travel-assistant.png`;

type SeoConfig = {
  title: string;
  description: string;
  keywords: string;
  path: string;
  type?: "website" | "article";
};

const SEO_BY_PATH: Record<string, SeoConfig> = {
  "/": {
    title: "Retreats Holidays | Wellness & Yoga Retreats from the Middle East",
    description:
      "Discover wellness, yoga, and adventure retreats curated for travelers in Saudi Arabia, UAE, Qatar, Kuwait, Oman, and Egypt.",
    keywords:
      "wellness retreats middle east, yoga retreat dubai, luxury wellness holidays uae, saudi wellness retreats, qatar retreat holidays, oman yoga retreat, egypt wellness travel, retreats holidays",
    path: "/",
    type: "website",
  },
  "/retreats": {
    title: "Exclusive Retreat Packages | Retreats Holidays",
    description:
      "Browse exclusive retreat packages with yoga, spa, and adventure experiences. Filter by destination, budget, and duration.",
    keywords:
      "retreat packages uae, wellness holidays saudi arabia, dubai yoga retreats, qatar spa retreats, kuwait retreat packages, oman wellness vacation, egypt retreat tours",
    path: "/retreats",
  },
  "/our-exclusive-retreats": {
    title: "Our Exclusive Retreats | Retreats Holidays",
    description:
      "Explore hand-picked wellness and adventure retreats designed for travelers across the GCC and wider Middle East.",
    keywords:
      "exclusive retreats middle east, dubai wellness trips, saudi luxury retreats, qatar yoga travel, kuwait wellness holidays, oman retreat experiences, egypt wellness retreats",
    path: "/our-exclusive-retreats",
  },
  "/about": {
    title: "About Retreats Holidays | Wellness Travel Experts",
    description:
      "Learn about Retreats Holidays, founded in Dubai and trusted for curated wellness adventures across global destinations.",
    keywords:
      "about retreats holidays, dubai wellness travel company, middle east retreat experts, yoga travel specialists",
    path: "/about",
  },
  "/about-retreats-holidays": {
    title: "About Retreats Holidays | Wellness Travel Experts",
    description:
      "Learn about Retreats Holidays, founded in Dubai and trusted for curated wellness adventures across global destinations.",
    keywords:
      "about retreats holidays, dubai wellness travel company, middle east retreat experts, yoga travel specialists",
    path: "/about-retreats-holidays",
  },
  "/contact": {
    title: "Contact Retreats Holidays | Dubai, Mauritius, Paris, Cairo",
    description:
      "Get in touch with Retreats Holidays for personalized retreat recommendations, partnerships, and bookings.",
    keywords:
      "contact retreats holidays, dubai retreat agency, wellness travel consultation, retreat booking middle east",
    path: "/contact",
  },
  "/terms": {
    title: "Terms & Conditions | Retreats Holidays",
    description:
      "Read the terms and conditions for using Retreats Holidays services and retreat booking experiences.",
    keywords: "retreat booking terms, retreats holidays policy, wellness travel terms",
    path: "/terms",
  },
};

const DEFAULT_SEO: SeoConfig = SEO_BY_PATH["/"];

const ensureMeta = (attribute: "name" | "property", value: string) => {
  let element = document.head.querySelector(
    `meta[${attribute}="${value}"]`,
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  return element;
};

const ensureLink = (rel: string) => {
  let element = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  return element;
};

const SeoManager = () => {
  const { pathname } = useLocation();
  const seo = SEO_BY_PATH[pathname] ?? DEFAULT_SEO;
  const canonicalUrl = `${SITE_URL}${seo.path}`;

  useEffect(() => {
    document.title = seo.title;

    ensureMeta("name", "description").setAttribute("content", seo.description);
    ensureMeta("name", "keywords").setAttribute("content", seo.keywords);
    ensureMeta("name", "author").setAttribute("content", SITE_NAME);
    ensureMeta("name", "robots").setAttribute(
      "content",
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );
    ensureMeta("name", "geo.region").setAttribute("content", "AE-DU");
    ensureMeta("name", "geo.placename").setAttribute("content", "Dubai");
    ensureMeta("name", "geo.position").setAttribute(
      "content",
      "25.2048;55.2708",
    );
    ensureMeta("name", "ICBM").setAttribute("content", "25.2048, 55.2708");

    ensureMeta("property", "og:title").setAttribute("content", seo.title);
    ensureMeta("property", "og:description").setAttribute(
      "content",
      seo.description,
    );
    ensureMeta("property", "og:type").setAttribute("content", seo.type ?? "website");
    ensureMeta("property", "og:url").setAttribute("content", canonicalUrl);
    ensureMeta("property", "og:image").setAttribute("content", DEFAULT_IMAGE);
    ensureMeta("property", "og:site_name").setAttribute("content", SITE_NAME);
    ensureMeta("property", "og:locale").setAttribute("content", "en_US");

    ensureMeta("name", "twitter:card").setAttribute("content", "summary_large_image");
    ensureMeta("name", "twitter:title").setAttribute("content", seo.title);
    ensureMeta("name", "twitter:description").setAttribute(
      "content",
      seo.description,
    );
    ensureMeta("name", "twitter:image").setAttribute("content", DEFAULT_IMAGE);

    ensureLink("canonical").setAttribute("href", canonicalUrl);

    const schema = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: SITE_NAME,
      url: SITE_URL,
      image: DEFAULT_IMAGE,
      description: seo.description,
      email: "info@retreats-holidays.com",
      sameAs: [],
      areaServed: [
        "Saudi Arabia",
        "United Arab Emirates",
        "Qatar",
        "Kuwait",
        "Oman",
        "Egypt",
        "Dubai",
      ],
      availableLanguage: ["en", "ar"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dubai",
        addressCountry: "AE",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/our-exclusive-retreats`,
        "query-input": "required name=search_term_string",
      },
    };

    let script = document.head.querySelector(
      'script[data-seo="structured-data"]',
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-seo", "structured-data");
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema);
  }, [canonicalUrl, seo.description, seo.keywords, seo.title, seo.type]);

  return null;
};

export default SeoManager;
