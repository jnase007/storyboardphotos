import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero";
import { HomeTeasers } from "@/components/sections/home-teasers";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} | ${SITE.subtitle} — Kingdom Photo Studio in Costa Mesa`,
  },
  description: SITE.description,
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_US",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HomeTeasers />
    </>
  );
}
