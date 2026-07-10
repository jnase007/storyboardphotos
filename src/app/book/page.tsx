import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { BookingSection } from "@/components/sections/booking";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Book Your Session",
  description:
    "Book a faith-centered Kings & Queens session at Storybook Photos in Costa Mesa. Celebrate your child's God-given identity with portraits and a personalized storybook.",
  alternates: {
    canonical: `${SITE.url}/book`,
  },
  openGraph: {
    title: `Book Your Session | ${SITE.name}`,
    description:
      "Reserve your Kings & Queens session. Free portrait included with every package.",
    url: `${SITE.url}/book`,
  },
};

export default function BookPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="py-24 text-center text-royal-blue/60">
            Loading booking form…
          </div>
        }
      >
        <BookingSection />
      </Suspense>
    </PageShell>
  );
}
