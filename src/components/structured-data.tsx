import { FAQ_ITEMS, SITE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

type JsonLd = Record<string, unknown>;

function JsonLdScript({ id, data }: { id: string; data: JsonLd | JsonLd[] }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const localBusiness: JsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${SITE.url}/#business`,
  name: `${SITE.name} — ${SITE.subtitle}`,
  alternateName: ["Storybook Photos", "Kings & Queens Photo Studio"],
  description: SITE.description,
  url: SITE.url,
  email: SITE.email,
  telephone: SITE.phone,
  image: [
    absoluteUrl("/og-image.jpg"),
    absoluteUrl("/hero-kingdom.jpg"),
    absoluteUrl("/storybook-cover.webp"),
  ],
  logo: absoluteUrl("/favicon.svg"),
  priceRange: "$299-$499",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Credit Card",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3525 Hyland Ave, Suite 235",
    addressLocality: "Costa Mesa",
    addressRegion: "CA",
    postalCode: "92626",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.6846,
    longitude: -117.8865,
  },
  areaServed: [
    {
      "@type": "City",
      name: "Costa Mesa",
    },
    {
      "@type": "AdministrativeArea",
      name: "Orange County",
    },
    {
      "@type": "State",
      name: "California",
    },
  ],
  hasMap: "https://maps.google.com/?q=3525+Hyland+Ave+Suite+235+Costa+Mesa+CA+92626",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: SITE.social.filter(Boolean),
  knowsAbout: [
    "children photography",
    "kingdom-themed photo sessions",
    "personalized children's storybooks",
    "family photography Orange County",
    "kids portrait studio Costa Mesa",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      name: "Kingdom Chronicles",
      description:
        "45-minute kingdom photo session with personalized AI watercolor storybook.",
      price: "299",
      priceCurrency: "USD",
      url: absoluteUrl("/pricing"),
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Royal Portrait Album",
      description:
        "45-minute kingdom photo session with premium portrait photo book.",
      price: "299",
      priceCurrency: "USD",
      url: absoluteUrl("/pricing"),
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "The Royal Collection",
      description:
        "60-minute kingdom photo session with storybook and portrait album.",
      price: "499",
      priceCurrency: "USD",
      url: absoluteUrl("/pricing"),
      availability: "https://schema.org/InStock",
    },
  ],
};

const website: JsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: "en-US",
  publisher: {
    "@id": `${SITE.url}/#business`,
  },
};

const organization: JsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl("/favicon.svg"),
  email: SITE.email,
  telephone: SITE.phone,
  sameAs: SITE.social.filter(Boolean),
};

/** Global JSON-LD for every public page. */
export function StructuredData() {
  return (
    <>
      <JsonLdScript id="ld-local-business" data={localBusiness} />
      <JsonLdScript id="ld-website" data={website} />
      <JsonLdScript id="ld-organization" data={organization} />
    </>
  );
}

/** FAQPage schema for AEO / featured-snippet eligibility. */
export function FaqStructuredData() {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLdScript id="ld-faq" data={data} />;
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

/** BreadcrumbList schema for clearer AI + Google page hierarchy. */
export function BreadcrumbStructuredData({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return <JsonLdScript id="ld-breadcrumbs" data={data} />;
}
