import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { TestimonialsSection } from "@/components/sections/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read reviews from families whose children left Storybook Photos standing taller — reminded they are children of the King.",
};

export default function TestimonialsPage() {
  return (
    <PageShell>
      <TestimonialsSection />
    </PageShell>
  );
}
