import type { Metadata } from "next";
import { BusinessPlanPrintView } from "@/components/sections/business-plan-print-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Business Plan PDF (Internal)",
  description: "Printable business plan for Storybook Photos | Kingdom Quests.",
  path: "/business-plan/print",
  noIndex: true,
});

export default function BusinessPlanPrintPage() {
  return <BusinessPlanPrintView />;
}
