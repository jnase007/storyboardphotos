import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero";
import { HomeTeasers } from "@/components/sections/home-teasers";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `${SITE.name} | ${SITE.subtitle} — Kingdom Photo Studio in Costa Mesa`,
  description: SITE.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }]} />
      <HeroSection />
      <HomeTeasers />
    </>
  );
}
