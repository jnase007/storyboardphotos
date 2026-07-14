import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import {
  LocalLandingSection,
  type LocalLandingContent,
} from "@/components/sections/local-landing";
import {
  BreadcrumbStructuredData,
  FaqStructuredDataFromItems,
} from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

const content: LocalLandingContent = {
  eyebrow: "Orange County Children Photography",
  h1: "Children Photography in Orange County — Magical Studio Sessions",
  intro:
    "Storybook Photos is an Orange County children photography studio based in Costa Mesa. We specialize in immersive kingdom sessions that turn kids into royalty and capture heirloom portraits and personalized storybooks for families across OC.",
  highlights: [
    "Serving families across Orange County from our Costa Mesa studio",
    "Kingdom-themed sets designed for kids ages 2–12",
    "Confidence-building experience, not rushed volume portraits",
    "Transparent packages with printed hardcovers included",
  ],
  sections: [
    {
      title: "Children photography that feels like an adventure",
      body: "Traditional kids portraits can feel stiff. Our Orange County families come for something different: costumes, immersive sets, and a session flow that helps children feel safe, celebrated, and brave. The result is natural expression — joy, courage, curiosity — not forced smiles.",
    },
    {
      title: "A studio experience for OC parents who want more than files",
      body: "Digital galleries are useful. Keepsakes last. That is why every package includes a premium printed hardcover book — either a personalized Kingdom Chronicles adventure story or a Royal Portrait Album. Want both? The Royal Collection packages the complete set.",
    },
    {
      title: "Easy to book for Newport, Irvine, HB, and beyond",
      body: "Whether you are coming from Newport Beach, Irvine, Huntington Beach, Tustin, Fountain Valley, or elsewhere in Orange County, Costa Mesa is a central meet point. Book online, share a few details about your child, and we handle the rest — sets, story direction, and session pacing.",
    },
  ],
  faqs: [
    {
      question: "Do you serve all of Orange County?",
      answer:
        "Yes. Sessions are held at our Costa Mesa studio and are convenient for families across Orange County and nearby coastal cities.",
    },
    {
      question: "What makes Storybook Photos different from other OC kids photographers?",
      answer:
        "We combine immersive kingdom sets with personalized hardcover storybooks. Your child is not just photographed — they become the hero of their own adventure.",
    },
    {
      question: "How long is a children photography session?",
      answer:
        "Most sessions run 45–60 minutes depending on package, with enough time for wardrobe, sets, and natural moments.",
    },
  ],
  ctaLabel: "Book an Orange County Session",
};

export const metadata: Metadata = buildMetadata({
  title: "Children Photography Orange County | Storybook Photos",
  description:
    "Children photography in Orange County with kingdom-themed studio sessions and personalized storybooks. Based in Costa Mesa. Packages from $299 at Storybook Photos.",
  path: "/children-photography-orange-county",
  keywords: [
    "children photography Orange County",
    "kids photographer Orange County",
    "OC children portraits",
    "family photographer Orange County",
    "kids photo studio OC",
  ],
});

export default function ChildrenPhotographyOrangeCountyPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          {
            name: "Children Photography Orange County",
            path: "/children-photography-orange-county",
          },
        ]}
      />
      <FaqStructuredDataFromItems items={content.faqs} id="ld-faq-oc" />
      <LocalLandingSection content={content} />
    </PageShell>
  );
}
