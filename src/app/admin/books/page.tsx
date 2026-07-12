import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { BooksLibrary } from "@/components/admin/books-library";

export const metadata: Metadata = {
  title: "Books Library | Storybook Photos Admin",
  description: "All generated storybooks — share, download, or delete.",
  robots: {
    index: false,
    follow: false,
  },
};

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
