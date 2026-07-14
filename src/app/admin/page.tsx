import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Admin Dashboard (Internal)",
  description: "Internal staff dashboard for Storybook Photos.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Admin Dashboard"
        description="Staff tools — enter the access code to continue."
        buttonLabel="Enter Admin"
      >
        <AdminDashboard />
      </PasswordGate>
    </PageShell>
  );
}
