import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PricingSection } from "@/components/sections/pricing";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing & Packages — Choose Your Royal Quest",
  description:
    "Kings & Queens packages: Royal Portrait $450, Kingdom Adventure $750, Heirloom Legacy $1,200. Free portrait included. Heirloom prints & storybooks available. Costa Mesa, CA.",
  alternates: {
    canonical: `${SITE.url}/pricing`,
  },
  openGraph: {
    title: `Pricing & Packages | ${SITE.name}`,
    description:
      "Choose your royal quest — transparent packages from $450 with a free portrait included. Payment plans available.",
    url: `${SITE.url}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <PageShell>
      <PricingSection />
    </PageShell>
  );
}
