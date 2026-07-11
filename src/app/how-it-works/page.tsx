import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { HowItWorksSection } from "@/components/sections/how-it-works";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Five simple steps from choosing your quest to receiving a faith-filled Kingdom Chronicles that reminds your child they are a child of the King.",
};

export default function HowItWorksPage() {
  return (
    <PageShell>
      <HowItWorksSection />
    </PageShell>
  );
}
