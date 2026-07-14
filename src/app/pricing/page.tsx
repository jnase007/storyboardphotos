import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PricingSection } from "@/components/sections/pricing";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing & Packages — Kingdom Chronicles from $299",
  description:
    "Transparent Storybook Photos packages: Kingdom Chronicles $299, Royal Portrait Album $299, and The Royal Collection $499. Costa Mesa kids photo studio with printed hardcovers included.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <PricingSection />
    </PageShell>
  );
}
