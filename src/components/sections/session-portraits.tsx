"use client";

import Image from "next/image";
import { SectionOrnament } from "@/components/section-ornament";

/** Real studio session stills — first princess/kingdom batch (more kids coming). */
export const SESSION_PORTRAITS = [
  {
    src: "/brand/pro-session-gallery/princess-set-01.jpg",
    alt: "Child in a white gown looking toward a kingdom castle backdrop",
  },
  {
    src: "/brand/pro-session-gallery/princess-set-02.jpg",
    alt: "Child kneeling by a treasure chest with rabbits on the moss",
  },
  {
    src: "/brand/pro-session-gallery/princess-set-03.jpg",
    alt: "Child twirling a white tulle dress under cherry blossoms",
  },
  {
    src: "/brand/pro-session-gallery/princess-set-04.jpg",
    alt: "Child opening a wooden treasure chest in the kingdom set",
  },
  {
    src: "/brand/pro-session-gallery/princess-set-05.jpg",
    alt: "Child in a tiara smiling and holding a white gown",
  },
  {
    src: "/brand/pro-session-gallery/princess-set-06.jpg",
    alt: "Close portrait of a child in a jeweled crown, smiling",
  },
  {
    src: "/brand/pro-session-gallery/princess-set-07.jpg",
    alt: "Child holding a small rabbit figurine in the kingdom set",
  },
] as const;

type SessionPortraitsSectionProps = {
  /** Homepage uses dark enchanted night; Experience uses cream. */
  variant?: "home" | "experience";
};

export function SessionPortraitsSection({
  variant = "home",
}: SessionPortraitsSectionProps) {
  const isHome = variant === "home";
  // Double the strip so CSS marquee loops without a visible jump.
  const loop = [...SESSION_PORTRAITS, ...SESSION_PORTRAITS];

  return (
    <section
      className={
        isHome
          ? "relative py-16 sm:py-20 bg-enchanted-night overflow-hidden"
          : "relative py-16 sm:py-20 bg-white overflow-hidden"
      }
      aria-label="Real session portraits"
    >
      {isHome ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-royal-gold/50 to-transparent"
          aria-hidden="true"
        />
      ) : null}

      <div className="container mx-auto px-4 lg:px-8 relative mb-8 sm:mb-10">
        <div className="text-center max-w-2xl mx-auto">
          <SectionOrnament className={isHome ? "" : "[&_span]:text-royal-gold"} />
          <p
            className={
              isHome
                ? "text-royal-gold font-medium tracking-widest uppercase text-sm mb-3"
                : "text-royal-gold font-medium tracking-widest uppercase text-sm mb-3"
            }
          >
            Real Session Photos
          </p>
          <h2
            className={
              isHome
                ? "font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-cream mb-3"
                : "font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-3"
            }
          >
            This is how it looks
          </h2>
          <p
            className={
              isHome
                ? "text-royal-cream/65 text-base sm:text-lg leading-relaxed"
                : "text-royal-blue/60 text-base sm:text-lg leading-relaxed"
            }
          >
            Real portraits from our Costa Mesa kingdom set — soft light, real
            costumes, real wonder. More little kings and queens coming soon.
          </p>
        </div>
      </div>

      {/* Full-bleed auto scroller — hero stays untouched above */}
      <div className="relative">
        <div
          className={
            isHome
              ? "pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-enchanted-night to-transparent"
              : "pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-white to-transparent"
          }
          aria-hidden="true"
        />
        <div
          className={
            isHome
              ? "pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-enchanted-night to-transparent"
              : "pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-white to-transparent"
          }
          aria-hidden="true"
        />

        <div className="overflow-hidden">
          <div className="session-portrait-track flex w-max gap-4 sm:gap-5 px-4 sm:px-6">
            {loop.map((shot, index) => (
              <figure
                key={`${shot.src}-${index}`}
                className={
                  isHome
                    ? "relative shrink-0 w-[240px] sm:w-[300px] lg:w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border border-royal-gold/35 bg-royal-blue/30 shadow-xl shadow-black/30"
                    : "relative shrink-0 w-[240px] sm:w-[300px] lg:w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border border-royal-gold/25 bg-enchanted-cream shadow-lg shadow-royal-blue/10"
                }
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 240px, (max-width: 1024px) 300px, 340px"
                  // First few get priority on homepage for LCP-ish feel; rest lazy.
                  priority={isHome && index < 3}
                />
              </figure>
            ))}
          </div>
        </div>
      </div>

      <p
        className={
          isHome
            ? "mt-6 text-center text-royal-cream/45 text-sm px-4"
            : "mt-6 text-center text-royal-blue/45 text-sm px-4"
        }
      >
        Kingdom set · Costa Mesa studio · more family sessions on the way
      </p>
    </section>
  );
}
