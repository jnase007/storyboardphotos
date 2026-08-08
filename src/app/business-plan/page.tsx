import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { BusinessPlanHub } from "@/components/sections/business-plan-hub";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Business Plan (Internal)",
  description:
    "Internal business plan — full plan, phases, cost breakdown, and proforma.",
  path: "/business-plan",
  noIndex: true,
});

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
        <Suspense fallback={<div className="p-12 text-center text-royal-blue/60">Loading plan…</div>}>
          <BusinessPlanHub />
        </Suspense>
      </PasswordGate>
    </PageShell>
  );
}
