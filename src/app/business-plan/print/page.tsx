import type { Metadata } from "next";
import { BusinessPlanPrintView } from "@/components/sections/business-plan-print-view";

export const metadata: Metadata = {
  title: "Business Plan PDF (Internal)",
  description: "Printable business plan for Storybook Photos | Kingdom Quests.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BusinessPlanPrintPage() {
  return <BusinessPlanPrintView />;
}
