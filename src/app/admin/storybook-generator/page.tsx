import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { StorybookGenerator } from "@/components/admin/storybook-generator";

export const metadata: Metadata = {
  title: "Storybook Generator (Internal)",
  description: "Internal staff tool to generate personalized kingdom storybooks.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StorybookGeneratorPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Storybook Generator"
        description="Internal staff tool — enter the access code to continue."
        buttonLabel="Open Generator"
      >
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-royal-blue/50 text-sm">
              Loading generator…
            </div>
          }
        >
          <StorybookGenerator />
        </Suspense>
      </PasswordGate>
    </PageShell>
  );
}
