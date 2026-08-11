import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PasswordGate } from "@/components/password-gate";
import { ShirtReview } from "@/components/admin/shirt-review";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Review Shirt (Internal)",
  description: "Review the white tee mockup for a storybook.",
  path: "/admin/books/shirt",
  noIndex: true,
});

export default async function ShirtReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageShell>
      <PasswordGate
        code="3121"
        storageKey="sbp-unlock-admin"
        title="Shirt Review"
        description="Staff only — review the white tee for this book."
        buttonLabel="Open Shirt Review"
      >
        <ShirtReview bookId={id} />
      </PasswordGate>
    </PageShell>
  );
}
