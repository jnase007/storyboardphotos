import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { FAQSection } from "@/components/sections/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Storybook Photos Kings & Queens — our biblical foundation, ages, session length, storybooks, and studio location.",
};

export default function FAQPage() {
  return (
    <PageShell>
      <FAQSection />
    </PageShell>
  );
}
