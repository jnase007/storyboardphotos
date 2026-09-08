import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { KingdomSetsSection } from "@/components/sections/kingdom-sets";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kingdom Sets — Throne Room Main Set & More Coming",
  description:
    "Explore the Storybook Photos Throne Room — our signature live set in Costa Mesa — plus more kingdom worlds coming soon: Royal Forest, Royal Garden, and Chastle.",
  path: "/kingdom-sets",
});

export default function KingdomSetsPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Kingdom Sets", path: "/kingdom-sets" },
        ]}
      />
      <KingdomSetsSection />
    </PageShell>
  );
}
