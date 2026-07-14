"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, Heart } from "lucide-react";
import { SITE } from "@/lib/constants";
import { EnchantEmbers } from "@/components/enchant-embers";

const HERO_BACKGROUNDS = [
  {
    src: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/hero-images/gemini-watercolor-hero.jpg",
    alt: "Magical Kingdom Watercolor — Storybook Photos Kings & Queens",
  },
  {
    src: "/sets/royal-forest.webp",
    alt: "Royal Forest set — Storybook Photos Kings & Queens",
  },
  {
    src: "/hero-council-hall.webp",
    alt: "Royal Garden set — Storybook Photos Kings & Queens",
  },
  {
    src: "/sets/chastle.webp",
    alt: "Chastle set — Storybook Photos Kings & Queens",
  },
] as const;

const ROTATE_MS = 7000;

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <AnimatePresence mode="sync">
        {HERO_BACKGROUNDS.map((bg, index) =>
          index === activeIndex ? (
            <motion.div
              key={bg.src}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={bg.src}
                alt={bg.alt}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-royal-blue/45 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-royal-blue/75 via-royal-blue/40 to-royal-purple/25 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-royal-cream via-transparent to-royal-blue/20 z-[1]" />
      <div
        className="absolute inset-0 z-[1] opacity-50 mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 40% at 70% 30%, rgba(212,176,122,0.45), transparent 70%)",
        }}
      />

      <EnchantEmbers />

      <div className="container mx-auto px-4 lg:px-8 pt-[calc(var(--promo-bar-height,0px)+6rem)] pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-royal-cream leading-tight mb-6 drop-shadow-lg">
              Remind Your Child
              <br />
              <span className="text-gradient-gold-shine">They Are Royalty</span>
            </h1>

            <p className="text-lg text-royal-cream/90 max-w-lg mb-8 leading-relaxed drop-shadow">
              Kingdom-themed photo shoots and Kingdom Chronicles that help
              kids feel brave, beloved, and full of wonder — an enchanted
              adventure they&apos;ll never forget.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-8">
              <Link
                href="/book"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-base font-semibold text-royal-blue glow-gold transition-all hover:bg-[#D4B480] hover:scale-[1.02]"
              >
                Book Your Session
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href="/experience"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-royal-gold/50 bg-royal-blue/40 backdrop-blur-sm px-8 text-base font-semibold text-royal-cream transition-all hover:border-royal-gold hover:bg-royal-gold/15"
              >
                Explore the Experience
              </Link>
            </div>

            <div className="flex items-center gap-2 text-royal-cream/70 text-sm">
              <MapPin className="h-4 w-4 text-royal-gold shrink-0" />
              <span>Premium studio in {SITE.location}</span>
            </div>

            <div className="flex gap-1 mt-8">
              {HERO_BACKGROUNDS.map((bg, index) => (
                <button
                  key={bg.src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="inline-flex h-11 w-11 items-center justify-center"
                  aria-label={`Show background ${index + 1}`}
                >
                  <span
                    className={`rounded-full transition-all ${
                      index === activeIndex
                        ? "h-1.5 w-8 bg-royal-gold shadow-[0_0_12px_rgba(197,162,111,0.7)]"
                        : "h-1.5 w-1.5 bg-royal-cream/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-2xl border border-royal-gold/40 bg-royal-blue/55 backdrop-blur-md p-8 sm:p-10 glow-lantern">
              <div
                className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-royal-gold/70 to-transparent"
                aria-hidden="true"
              />
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-royal-gold/20 mb-5 ring-1 ring-royal-gold/30">
                <Heart className="h-6 w-6 text-royal-gold" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-cream mb-3">
                We Curate Every Moment for Your Child
              </h2>
              <p className="text-royal-cream/75 leading-relaxed mb-6">
                Before you arrive, we learn everything about your child — their personality, their favorite story, what makes them light up. When you walk through the door, we&apos;ve already built the day around them. You experience the magic. We handle everything else.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-royal-cream/80">
                <li className="flex gap-2">
                  <span className="text-royal-gold">✦</span>
                  Which quest speaks to your child&apos;s heart?
                </li>
                <li className="flex gap-2">
                  <span className="text-royal-gold">✦</span>
                  What do you want them to believe about themselves?
                </li>
                <li className="flex gap-2">
                  <span className="text-royal-gold">✦</span>
                  What should we know to make this day unforgettable?
                </li>
              </ul>
              <Link
                href="/book"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-base font-semibold text-royal-blue hover:bg-[#D4B480] transition-all hover:scale-[1.02]"
              >
                Begin Their Quest
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
