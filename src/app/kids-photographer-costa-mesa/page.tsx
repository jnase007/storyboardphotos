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
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

const content: LocalLandingContent = {
  eyebrow: "Costa Mesa Kids Photographer",
  h1: "Kids Photographer in Costa Mesa — Kingdom Photo Sessions",
  intro:
    "Looking for a kids photographer in Costa Mesa who does more than a plain backdrop? Storybook Photos creates immersive kingdom-themed sessions where children dress as royalty, explore magical sets, and leave with portraits (and optional storybooks) that build confidence.",
  highlights: [
    "Studio at 3525 Hyland Ave, Suite 235, Costa Mesa, CA 92626",
    "Best for ages 2–12, siblings welcome",
    "Four immersive kingdom sets — not a generic portrait wall",
    "Packages from $299 with printed hardcover keepsakes",
  ],
  sections: [
    {
      title: "A kids photo experience built for wonder",
      body: "Parents searching for a Costa Mesa kids photographer usually want two things: beautiful images and a session their child actually enjoys. Our Kings & Queens experience is designed around play, costumes, and immersive environments — Throne Room, Royal Forest, Royal Garden, and Chastle — so shy kids can warm up and bold kids can shine.",
    },
    {
      title: "Portraits plus personalized storybooks",
      body: "Every session can include a Kingdom Chronicles storybook where your child is the hero of the adventure. That means you leave with more than digital files — you get a premium hardcover keepsake families re-read at bedtime. Portrait albums are also available if you want a classic photo book instead of (or in addition to) the storybook.",
    },
    {
      title: "Convenient for Orange County families",
      body: "Our Costa Mesa studio is easy to reach from Newport Beach, Irvine, Huntington Beach, Santa Ana, and surrounding OC cities. Sessions are 45–60 minutes depending on package, with patient guidance so parents do not need to invent poses or bring complicated props.",
    },
  ],
  faqs: [
    {
      question: "Where is your kids photography studio in Costa Mesa?",
      answer:
        "Storybook Photos is at 3525 Hyland Ave, Suite 235, Costa Mesa, CA 92626. Parking details are sent when your session is confirmed.",
    },
    {
      question: "What ages do you photograph?",
      answer:
        "Our sessions are designed primarily for ages 2–12. Siblings and family members are welcome depending on package.",
    },
    {
      question: "How much does a Costa Mesa kids photo session cost?",
      answer:
        "Packages start at $299 for Kingdom Chronicles or the Royal Portrait Album. The Royal Collection (both books) starts at $499.",
    },
  ],
  ctaLabel: "Book a Costa Mesa Session",
};

export const metadata: Metadata = buildMetadata({
  title: "Kids Photographer Costa Mesa | Kingdom Photo Studio",
  description:
    "Kids photographer in Costa Mesa offering kingdom-themed portrait sessions and personalized storybooks. Immersive sets, ages 2–12, packages from $299 at Storybook Photos.",
  path: "/kids-photographer-costa-mesa",
  keywords: [
    "kids photographer Costa Mesa",
    "children photographer Costa Mesa",
    "kids photo studio Costa Mesa",
    "family photographer Costa Mesa",
    "children portraits Orange County",
  ],
});

export default function KidsPhotographerCostaMesaPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          {
            name: "Kids Photographer Costa Mesa",
            path: "/kids-photographer-costa-mesa",
          },
        ]}
      />
      <FaqStructuredDataFromItems items={content.faqs} id="ld-faq-costa-mesa" />
      <LocalLandingSection content={content} />
    </PageShell>
  );
}
