import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { ProformaSection } from "@/components/sections/proforma";

export const metadata: Metadata = {
  title: "Pre-Launch Proforma (Internal)",
  description:
    "Startup capital, monthly ramp, break-even, and Year 1–3 proforma P&L before launch.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProformaPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Pre-Launch Proforma"
        description="Internal planning document — password protected."
        buttonLabel="View Proforma"
      >
        <ProformaSection />
      </PasswordGate>
    </PageShell>
  );
}
