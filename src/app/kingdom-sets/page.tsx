import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { KingdomSetsSection } from "@/components/sections/kingdom-sets";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kingdom Sets — Throne Room, Forest, Garden & Castle",
  description:
    "Explore four immersive kingdom sets in Costa Mesa — Throne Room, Royal Forest, Royal Garden, and Chastle — designed for magical kids portraits and storybook photos.",
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
