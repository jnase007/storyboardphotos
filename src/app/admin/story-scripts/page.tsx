import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { StoryScriptsEditor } from "@/components/admin/story-scripts-editor";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Story Scripts (Internal)",
  description:
    "Edit the 6 choose-your-own-adventure story paths for the kiosk generator.",
  path: "/admin/story-scripts",
  noIndex: true,
});

export default function StoryScriptsPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Story Scripts"
        description="Choose-your-own-adventure scripts for the kiosk — enter the access code."
        buttonLabel="Open Scripts"
      >
        <StoryScriptsEditor />
      </PasswordGate>
    </PageShell>
  );
}
