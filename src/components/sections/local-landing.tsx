import Link from "next/link";
import { ArrowRight, Check, MapPin, Sparkles } from "lucide-react";
import { SITE } from "@/lib/constants";

export type LocalLandingContent = {
  eyebrow: string;
  h1: string;
  intro: string;
  highlights: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  ctaLabel?: string;
};

export function LocalLandingSection({ content }: { content: LocalLandingContent }) {
  return (
    <section className="bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8 py-16 sm:py-20 max-w-5xl">
        <div className="mb-10">
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            {content.eyebrow}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-5 leading-tight">
            {content.h1}
          </h1>
          <p className="text-royal-blue/70 text-lg leading-relaxed max-w-3xl">
            {content.intro}
          </p>
          <div className="mt-4 flex items-start gap-2 text-royal-blue/60 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-royal-gold shrink-0" />
            <span>{SITE.address}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {content.highlights.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-royal-gold/25 bg-white/80 p-5"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-royal-gold/15">
                <Check className="h-3.5 w-3.5 text-royal-gold" />
              </span>
              <p className="text-royal-blue/80 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8 mb-14">
          {content.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-royal-gold/20 bg-white/70 p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-royal-gold" />
                <h2 className="font-serif text-2xl font-bold text-royal-blue">
                  {section.title}
                </h2>
              </div>
              <p className="text-royal-blue/70 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-royal-gold/25 bg-royal-blue text-royal-cream p-6 sm:p-8 mb-14">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            Ready to book your session?
          </h2>
          <p className="text-royal-cream/75 mb-6 max-w-2xl">
            Packages start at $299 and include a studio session plus a premium
            printed hardcover keepsake. Choose your quest and reserve a date.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/book"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-base font-semibold text-royal-blue hover:bg-[#D4B480] transition-colors"
            >
              {content.ctaLabel ?? "Book Your Session"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-md border border-royal-gold/40 px-8 text-base font-semibold text-royal-cream hover:bg-white/5 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {content.faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-royal-gold/20 bg-white/80 p-5 sm:p-6"
              >
                <h3 className="font-serif text-lg font-bold text-royal-blue mb-2">
                  {faq.question}
                </h3>
                <p className="text-royal-blue/70 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
