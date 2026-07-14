import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "How It Works — Book a Kingdom Photo Session",
  description:
    "Five simple steps from choosing your quest to receiving a personalized Kingdom Chronicles storybook that helps your child feel brave, beloved, and full of wonder.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "How It Works", path: "/how-it-works" },
        ]}
      />
      <HowItWorksSection />
    </PageShell>
  );
}
