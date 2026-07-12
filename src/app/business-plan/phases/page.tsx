import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { PhaseDecisionSection } from "@/components/sections/phase-decision";

export const metadata: Metadata = {
  title: "Phase Decision — Beta → Retail → Scale (Internal)",
  description:
    "Office beta vs full retail + kitchen vs multi-set scale — economics and gate metrics before pulling the trigger.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PhaseDecisionPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Phase Decision"
        description="Internal roadmap — password protected."
        buttonLabel="View Phase Decision"
      >
        <PhaseDecisionSection />
      </PasswordGate>
    </PageShell>
  );
}
