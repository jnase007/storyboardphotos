import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <section className="py-16 sm:py-20 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
          Legal
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-blue mb-2">
          {title}
        </h1>
        <p className="text-royal-blue/50 text-sm mb-10">
          Last updated: {updated}
        </p>
        <div className="legal-prose space-y-8 text-royal-blue/80 leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-royal-blue mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm sm:text-base">{children}</div>
    </section>
  );
}
