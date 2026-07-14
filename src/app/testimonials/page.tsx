import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Testimonials — Families Who Found Confidence",
  description:
    "Read reviews from Orange County families whose children left Storybook Photos standing taller — celebrated through kingdom portraits and storybooks.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Testimonials", path: "/testimonials" },
        ]}
      />
      <TestimonialsSection />
    </PageShell>
  );
}
