import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { CostBreakdownSection } from "@/components/sections/cost-breakdown";

export const metadata: Metadata = {
  title: "Capacity Cost Breakdown (Internal)",
  description:
    "Small vs large capacity P&L — revenue, COGS, margin, expenses, and net.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CostBreakdownPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Capacity Cost Breakdown"
        description="Internal P&L model — password protected."
        buttonLabel="View Cost Breakdown"
      >
        <CostBreakdownSection />
      </PasswordGate>
    </PageShell>
  );
}
