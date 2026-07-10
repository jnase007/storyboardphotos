import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { BusinessPlanSection } from "@/components/sections/business-plan";

export const metadata: Metadata = {
  title: "Business Plan (Internal)",
  description: "Internal business plan for Storybook Photos | Kingdom Quests.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BusinessPlanPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Business Plan"
        description="Internal document — password protected. Enter the access code to view."
        buttonLabel="View Business Plan"
      >
        <BusinessPlanSection />
      </PasswordGate>
    </PageShell>
  );
}
