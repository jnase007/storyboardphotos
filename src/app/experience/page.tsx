import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ExperienceSection } from "@/components/sections/experience";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Experience — Kingdom Kids Photo Sessions in Costa Mesa",
  description:
    "Discover Storybook Photos Kings & Queens: immersive kingdom sets, confidence-building portraits, and personalized Kingdom Chronicles storybooks in Costa Mesa, CA.",
  path: "/experience",
});

export default function ExperiencePage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "The Experience", path: "/experience" },
        ]}
      />
      <ExperienceSection />
    </PageShell>
  );
}
