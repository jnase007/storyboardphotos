import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { FAQSection } from "@/components/sections/faq";
import {
  BreadcrumbStructuredData,
  FaqStructuredData,
} from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ — Storybook Photos Kids Sessions & Storybooks",
  description:
    "Frequently asked questions about Storybook Photos in Costa Mesa — ages, session length, Kingdom Chronicles storybooks, packages, and studio location.",
  path: "/faq",
});

export default function FAQPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]}
      />
      <FaqStructuredData />
      <FAQSection />
    </PageShell>
  );
}
