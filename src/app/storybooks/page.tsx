import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { StorybooksSection } from "@/components/sections/storybooks";

export const metadata: Metadata = {
  title: "Kingdom Chronicless",
  description:
    "Personalized faith-filled storybooks that speak biblical identity over your child — loved, chosen, and created with purpose — with museum-quality print from Storybook Photos.",
};

export default function StorybooksPage() {
  return (
    <PageShell>
      <StorybooksSection />
    </PageShell>
  );
}
