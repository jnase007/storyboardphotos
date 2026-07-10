import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ExperienceSection } from "@/components/sections/experience";

export const metadata: Metadata = {
  title: "The Experience",
  description:
    "Discover Storybook Photos Kings & Queens — biblically based kingdom sessions that build lasting self-esteem through identity in Christ, immersive sets, and heirloom storybooks in Costa Mesa, CA.",
};

export default function ExperiencePage() {
  return (
    <PageShell>
      <ExperienceSection />
    </PageShell>
  );
}
