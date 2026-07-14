import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { BooksLibrary } from "@/components/admin/books-library";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Books Library (Internal)",
  description: "All generated storybooks — share, download, or delete.",
  path: "/admin/books",
  noIndex: true,
});

export default function BooksPage() {
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Books Library"
        description="Staff only — enter the access code to view generated storybooks."
        buttonLabel="Open Library"
      >
        <BooksLibrary />
      </PasswordGate>
    </PageShell>
  );
}
