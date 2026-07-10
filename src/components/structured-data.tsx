import { SITE } from "@/lib/constants";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${SITE.name} — ${SITE.subtitle}`,
    description: SITE.description,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "3525 Hyland Ave, Suite 235",
      addressLocality: "Costa Mesa",
      addressRegion: "CA",
      postalCode: "92626",
      addressCountry: "US",
    },
    priceRange: "$450-$1200",
    image: `${SITE.url}/og-image.jpg`,
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
