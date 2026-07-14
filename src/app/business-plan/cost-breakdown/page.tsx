import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { CostBreakdownSection } from "@/components/sections/cost-breakdown";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Capacity Cost Breakdown (Internal)",
  description:
    "Small vs large capacity P&L — revenue, COGS, margin, expenses, and net.",
  path: "/business-plan/cost-breakdown",
  noIndex: true,
});

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
