import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { blogPosts } from "@/content/blog/posts";

const SITE_URL = "https://retreats-holidays.com";
const SITE_NAME = "Retreats Holidays";
const DEFAULT_IMAGE = `${SITE_URL}/travel-assistant.png`;

type SeoConfig = {
  title: string;
  description: string;
  keywords: string;
  path: string;
  type?: "website" | "article";
  locale?: "en" | "ar";
  faq?: Array<{ q: string; a: string }>;
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
    locale: "en",
  },
  "/gcc": {
    title: "GCC Wellness Retreats | Retreats Holidays",
    description:
      "Wellness, yoga, and adventure retreats curated for travelers in Saudi Arabia, UAE (Dubai), Qatar, Kuwait, Oman, and Egypt.",
    keywords:
      "gcc wellness retreats, yoga retreats gcc, dubai wellness retreats, saudi wellness holidays, qatar yoga retreats, kuwait wellness travel, oman retreats, egypt retreats",
    path: "/gcc",
    type: "website",
    locale: "en",
  },
  "/ar/gcc": {
    title: "رحلات استجمام الخليج | Retreats Holidays",
    description:
      "رحلات يوغا واستجمام ومغامرات مخصصة للمسافرين من السعودية والإمارات وقطر والكويت وعُمان ومصر.",
    keywords:
      "رحلات استجمام الخليج, رحلات يوغا دبي, رحلات استجمام السعودية, رحلات يوغا قطر, رحلات استجمام الكويت, رحلات استجمام عمان, رحلات استجمام مصر",
    path: "/ar/gcc",
    type: "website",
    locale: "ar",
  },
  "/retreats": {
    title: "Exclusive Retreat Packages | Retreats Holidays",
    description:
      "Browse exclusive retreat packages with yoga, spa, and adventure experiences. Filter by destination, budget, and duration.",
    keywords:
      "retreat packages uae, wellness holidays saudi arabia, dubai yoga retreats, qatar spa retreats, kuwait retreat packages, oman wellness vacation, egypt retreat tours",
    path: "/retreats",
    locale: "en",
  },
  "/our-exclusive-retreats": {
    title: "Our Exclusive Retreats | Retreats Holidays",
    description:
      "Explore hand-picked wellness and adventure retreats designed for travelers across the GCC and wider Middle East.",
    keywords:
      "exclusive retreats middle east, dubai wellness trips, saudi luxury retreats, qatar yoga travel, kuwait wellness holidays, oman retreat experiences, egypt wellness retreats",
    path: "/our-exclusive-retreats",
    locale: "en",
  },
  "/retreats/saudi-arabia": {
    title: "Wellness Retreats for Saudi Arabia | Retreats Holidays",
    description:
      "Wellness and yoga retreats curated for travelers from Saudi Arabia. Shortlist options by destination, dates, budget, and activities with our AI assistant.",
    keywords:
      "saudi wellness retreats, yoga retreats saudi arabia, wellness holiday from saudi, riyadh wellness travel, jeddah yoga retreat",
    path: "/retreats/saudi-arabia",
    locale: "en",
    faq: [
      {
        q: "What’s the best retreat length for travelers from Saudi Arabia?",
        a: "Many guests choose 5–7 nights for a quick reset, or 8–12 nights for deeper wellness + activities.",
      },
      {
        q: "Can you recommend retreats for friends or family groups?",
        a: "Yes—ask for group-friendly retreats with shared villas, private sessions, and flexible itineraries.",
      },
      {
        q: "How do I shortlist retreats quickly?",
        a: 'Ask: "yoga retreat, 7 days, beach destination, budget $2000".',
      },
    ],
  },
  "/retreats/uae": {
    title: "Wellness Retreats for UAE & Dubai | Retreats Holidays",
    description:
      "Curated wellness, yoga, spa, and adventure retreats for travelers from UAE (Dubai). Get tailored recommendations with our AI assistant.",
    keywords:
      "dubai wellness retreats, uae yoga retreat, luxury wellness holidays uae, spa retreats dubai travelers",
    path: "/retreats/uae",
    locale: "en",
  },
  "/retreats/qatar": {
    title: "Wellness Retreats for Qatar | Retreats Holidays",
    description:
      "Wellness and yoga retreats curated for travelers from Qatar. Filter by budget, duration, and activities with our AI assistant.",
    keywords:
      "qatar wellness retreats, qatar yoga retreats, doha wellness holiday, spa retreats for qatar travelers",
    path: "/retreats/qatar",
    locale: "en",
  },
  "/retreats/kuwait": {
    title: "Wellness Retreats for Kuwait | Retreats Holidays",
    description:
      "Curated wellness and yoga retreats for travelers from Kuwait. Get AI-matched options by dates, budget, and style.",
    keywords:
      "kuwait wellness retreats, kuwait yoga retreat, wellness holidays from kuwait, spa retreats kuwait travelers",
    path: "/retreats/kuwait",
    locale: "en",
  },
  "/retreats/oman": {
    title: "Wellness Retreats for Oman | Retreats Holidays",
    description:
      "Find wellness, yoga, and nature-focused retreats curated for travelers from Oman. Shortlist quickly using our AI assistant.",
    keywords:
      "oman wellness retreats, oman yoga retreat, nature wellness retreats, wellness holidays from oman",
    path: "/retreats/oman",
    locale: "en",
  },
  "/retreats/egypt": {
    title: "Wellness Retreats for Egypt | Retreats Holidays",
    description:
      "Explore wellness and adventure retreats connected to Egypt experiences. Get tailored recommendations from our AI assistant.",
    keywords:
      "egypt wellness retreats, egypt yoga retreat, red sea wellness holiday, egypt wellness travel",
    path: "/retreats/egypt",
    locale: "en",
  },
  "/ar/retreats/saudi-arabia": {
    title: "رحلات استجمام للسعودية | Retreats Holidays",
    description:
      "رحلات يوغا واستجمام مخصصة للمسافرين من السعودية. احصل على ترشيحات حسب التواريخ والميزانية والأنشطة عبر المساعد الذكي.",
    keywords:
      "رحلات استجمام السعودية, رحلات يوغا السعودية, رحلات استجمام من الرياض, رحلات استجمام من جدة",
    path: "/ar/retreats/saudi-arabia",
    locale: "ar",
  },
  "/ar/retreats/uae": {
    title: "رحلات استجمام للإمارات (دبي) | Retreats Holidays",
    description:
      "رحلات يوغا وسبا ومغامرات للمسافرين من الإمارات ودبي. ترشيحات مخصصة عبر المساعد الذكي.",
    keywords:
      "رحلات استجمام دبي, رحلات يوغا دبي, رحلات سبا الإمارات, رحلات استجمام الإمارات",
    path: "/ar/retreats/uae",
    locale: "ar",
  },
  "/ar/retreats/qatar": {
    title: "رحلات استجمام لقطر | Retreats Holidays",
    description:
      "رحلات يوغا واستجمام للمسافرين من قطر. اختر حسب الميزانية والمدة والأنشطة عبر المساعد الذكي.",
    keywords:
      "رحلات استجمام قطر, رحلات يوغا قطر, رحلات سبا قطر, رحلات استجمام من الدوحة",
    path: "/ar/retreats/qatar",
    locale: "ar",
  },
  "/ar/retreats/kuwait": {
    title: "رحلات استجمام للكويت | Retreats Holidays",
    description:
      "رحلات يوغا واستجمام للمسافرين من الكويت. ترشيحات سريعة ومخصصة عبر المساعد الذكي.",
    keywords:
      "رحلات استجمام الكويت, رحلات يوغا الكويت, رحلات سبا الكويت",
    path: "/ar/retreats/kuwait",
    locale: "ar",
  },
  "/ar/retreats/oman": {
    title: "رحلات استجمام لعُمان | Retreats Holidays",
    description:
      "رحلات يوغا واستجمام وطبيعة للمسافرين من عُمان. احصل على اقتراحات مخصصة عبر المساعد الذكي.",
    keywords:
      "رحلات استجمام عمان, رحلات يوغا عمان, رحلات استجمام من مسقط",
    path: "/ar/retreats/oman",
    locale: "ar",
  },
  "/ar/retreats/egypt": {
    title: "رحلات استجمام لمصر | Retreats Holidays",
    description:
      "رحلات يوغا واستجمام ومغامرات مرتبطة بتجارب في مصر. ترشيحات سريعة عبر المساعد الذكي.",
    keywords:
      "رحلات استجمام مصر, رحلات يوغا مصر, رحلات سبا مصر, رحلات استجمام البحر الأحمر",
    path: "/ar/retreats/egypt",
    locale: "ar",
  },
  "/about": {
    title: "About Retreats Holidays | Wellness Travel Experts",
    description:
      "Learn about Retreats Holidays, founded in Dubai and trusted for curated wellness adventures across global destinations.",
    keywords:
      "about retreats holidays, dubai wellness travel company, middle east retreat experts, yoga travel specialists",
    path: "/about",
    locale: "en",
  },
  "/about-retreats-holidays": {
    title: "About Retreats Holidays | Wellness Travel Experts",
    description:
      "Learn about Retreats Holidays, founded in Dubai and trusted for curated wellness adventures across global destinations.",
    keywords:
      "about retreats holidays, dubai wellness travel company, middle east retreat experts, yoga travel specialists",
    path: "/about-retreats-holidays",
    locale: "en",
  },
  "/contact": {
    title: "Contact Retreats Holidays | Dubai, Mauritius, Paris, Cairo",
    description:
      "Get in touch with Retreats Holidays for personalized retreat recommendations, partnerships, and bookings.",
    keywords:
      "contact retreats holidays, dubai retreat agency, wellness travel consultation, retreat booking middle east",
    path: "/contact",
    locale: "en",
  },
  "/terms": {
    title: "Terms & Conditions | Retreats Holidays",
    description:
      "Read the terms and conditions for using Retreats Holidays services and retreat booking experiences.",
    keywords: "retreat booking terms, retreats holidays policy, wellness travel terms",
    path: "/terms",
    locale: "en",
  },
  "/blog": {
    title: "Wellness Retreat Blog (GCC) | Retreats Holidays",
    description:
      "Guides for travelers in Saudi Arabia, UAE, Qatar, Kuwait, Oman, and Egypt: how to choose yoga and wellness retreats by country, budget, and duration.",
    keywords:
      "wellness retreat blog, gcc yoga retreat guide, dubai wellness tips, saudi retreat planning, egypt wellness travel",
    path: "/blog",
    type: "website",
    locale: "en",
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
  const blogMatch = pathname.startsWith("/blog/")
    ? blogPosts.find((p) => p.lang === "en" && `/blog/${p.slug}` === pathname)
    : null;

  const seo: SeoConfig =
    blogMatch
      ? {
          title: `${blogMatch.title} | Retreats Holidays`,
          description: blogMatch.description,
          keywords: blogMatch.keywords,
          path: `/blog/${blogMatch.slug}`,
          type: "article",
          locale: "en",
        }
      : SEO_BY_PATH[pathname] ?? DEFAULT_SEO;
  const canonicalUrl = `${SITE_URL}${seo.path}`;
  const pageLocale = seo.locale ?? "en";

  useEffect(() => {
    document.title = seo.title;
    document.documentElement.lang = pageLocale;
    document.documentElement.dir = pageLocale === "ar" ? "rtl" : "ltr";

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
    ensureMeta("property", "og:locale").setAttribute(
      "content",
      pageLocale === "ar" ? "ar_AE" : "en_US",
    );

    ensureMeta("name", "twitter:card").setAttribute("content", "summary_large_image");
    ensureMeta("name", "twitter:title").setAttribute("content", seo.title);
    ensureMeta("name", "twitter:description").setAttribute(
      "content",
      seo.description,
    );
    ensureMeta("name", "twitter:image").setAttribute("content", DEFAULT_IMAGE);

    ensureLink("canonical").setAttribute("href", canonicalUrl);

    const faqSchema =
      seo.faq && seo.faq.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: seo.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }
        : null;

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

    script.textContent = JSON.stringify(
      faqSchema ? { "@graph": [schema, faqSchema] } : schema,
    );
  }, [
    canonicalUrl,
    pageLocale,
    seo.description,
    seo.faq,
    seo.keywords,
    seo.title,
    seo.type,
  ]);

  return null;
};

export default SeoManager;
