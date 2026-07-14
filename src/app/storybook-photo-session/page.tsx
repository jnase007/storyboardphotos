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
  eyebrow: "Storybook Photo Sessions",
  h1: "Storybook Photo Session — Your Child Becomes the Hero",
  intro:
    "A Storybook Photos session is more than portraits. Kids step into kingdom sets, dress as royalty, and leave with a personalized Kingdom Chronicles storybook where they are the hero of the adventure — a keepsake that builds confidence long after the session ends.",
  highlights: [
    "Choose from 6 adventure quests",
    "Immersive studio sets + costumes",
    "Personalized hardcover storybook options",
    "Costa Mesa studio serving Orange County families",
  ],
  sections: [
    {
      title: "What is a storybook photo session?",
      body: "It is a guided studio experience that combines professional children’s photography with a custom story. During the session, your child explores magical sets and is photographed as royalty. Afterward, we craft a premium printed book — either a personalized adventure story or a portrait album — so the memory becomes something they can hold.",
    },
    {
      title: "How the story becomes theirs",
      body: "When you book, you share your child’s name, age, and personality notes. They pick a quest (dragon, rescue mission, lost crown, forest guardian, and more). We use those details to personalize the story so your child is not a side character — they are the hero.",
    },
    {
      title: "Perfect for birthdays, milestones, and confidence gifts",
      body: "Parents book storybook sessions for birthdays, sibling celebrations, first-day-of-school keepsakes, and confidence-building gifts. The combination of dress-up, play, and a finished hardcover book makes the experience feel special without requiring parents to plan a complicated shoot.",
    },
  ],
  faqs: [
    {
      question: "What is included in a storybook photo session?",
      answer:
        "A studio session on immersive kingdom sets plus a premium printed hardcover book. Choose Kingdom Chronicles (story), Royal Portrait Album (portraits), or The Royal Collection (both).",
    },
    {
      question: "Can siblings do a storybook session together?",
      answer:
        "Yes. Sibling and multi-child options are available. Multiple children can share sets and appear together in portraits and books.",
    },
    {
      question: "How do I book a storybook photo session?",
      answer:
        "Book online at /book, choose your quest, and share a few details about your child. We confirm the session and guide you through the rest.",
    },
  ],
  ctaLabel: "Book a Storybook Session",
};

export const metadata: Metadata = buildMetadata({
  title: "Storybook Photo Session | Personalized Kids Storybooks",
  description:
    "Book a storybook photo session in Costa Mesa. Kingdom sets, royal costumes, and personalized hardcover storybooks that cast your child as the hero. Packages from $299.",
  path: "/storybook-photo-session",
  keywords: [
    "storybook photo session",
    "personalized children's storybook",
    "kids storybook photography",
    "kingdom photo session",
    "storybook portraits Costa Mesa",
  ],
});

export default function StorybookPhotoSessionPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          {
            name: "Storybook Photo Session",
            path: "/storybook-photo-session",
          },
        ]}
      />
      <FaqStructuredDataFromItems items={content.faqs} id="ld-faq-storybook-session" />
      <LocalLandingSection content={content} />
    </PageShell>
  );
}
