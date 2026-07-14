import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { StorybooksSection } from "@/components/sections/storybooks";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kingdom Chronicles — Personalized Kids Storybooks",
  description:
    "Personalized Kingdom Chronicles storybooks that cast your child as the hero — premium hardcover keepsakes from Storybook Photos in Costa Mesa, CA.",
  path: "/storybooks",
});

export default function StorybooksPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Storybooks", path: "/storybooks" },
        ]}
      />
      <StorybooksSection />
    </PageShell>
  );
}
