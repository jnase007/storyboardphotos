import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero";
import { HomeSellSection } from "@/components/sections/home-sell";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `${SITE.name} — Kingdom Photo Studio in Costa Mesa`,
  description: SITE.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }]} />
      <HeroSection />
      <HomeSellSection />
    </>
  );
}
