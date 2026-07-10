import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { KingdomSetsSection } from "@/components/sections/kingdom-sets";

export const metadata: Metadata = {
  title: "Kingdom Sets",
  description:
    "Explore four immersive kingdom sets — Castle Throne Room, Royal Forest, Royal Garden, and Courage Quest — designed to celebrate God-given dignity and identity.",
};

export default function KingdomSetsPage() {
  return (
    <PageShell>
      <KingdomSetsSection />
    </PageShell>
  );
}
