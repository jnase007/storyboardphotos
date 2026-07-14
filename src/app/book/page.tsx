import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { BookingSection } from "@/components/sections/booking";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Book Your Session — Kingdom Photo Shoot in Costa Mesa",
  description:
    "Book a Kings & Queens session at Storybook Photos in Costa Mesa. Choose your quest, reserve your kids photo shoot, and create a personalized Kingdom Chronicles storybook.",
  path: "/book",
});

export default function BookPage() {
  return (
    <PageShell>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Book Your Session", path: "/book" },
        ]}
      />
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
