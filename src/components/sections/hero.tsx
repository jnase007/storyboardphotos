"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Heart } from "lucide-react";
import { SITE } from "@/lib/constants";
import { EnchantEmbers } from "@/components/enchant-embers";

/** Homepage hero promo video (YouTube). */
const HERO_YOUTUBE_ID = "1ur6nkH-aZ0";
const HERO_YOUTUBE_EMBED = `https://www.youtube.com/embed/${HERO_YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${HERO_YOUTUBE_ID}&controls=1&rel=0&modestbranding=1&playsinline=1`;
const HERO_POSTER = "/brand-storefront.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-enchanted-night">
      {/* Soft brand backdrop behind the featured video */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_POSTER}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 bg-royal-blue/55 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-royal-blue/85 via-royal-blue/55 to-royal-purple/35 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-royal-cream via-transparent to-royal-blue/30 z-[1]" />
      <div
        className="absolute inset-0 z-[1] opacity-50 mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 40% at 70% 30%, rgba(212,176,122,0.45), transparent 70%)",
        }}
      />

      <EnchantEmbers />

      <div className="container mx-auto px-4 lg:px-8 pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height,6rem)+1.25rem)] lg:pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height-lg,7rem)+1.5rem)] pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
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
              adventure they'll never forget.
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
                href="/pricing"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-royal-gold/50 bg-royal-blue/40 backdrop-blur-sm px-8 text-base font-semibold text-royal-cream transition-all hover:border-royal-gold hover:bg-royal-gold/15"
              >
                Books from $299
              </Link>
            </div>

            <div className="flex flex-col gap-2 text-royal-cream/70 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-royal-gold shrink-0" />
                <span>Premium studio in {SITE.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-royal-gold shrink-0" />
                <span>Book · Movie · Memory they'll never outgrow</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="relative rounded-2xl overflow-hidden border border-royal-gold/40 bg-black shadow-2xl shadow-black/40 glow-lantern">
              <div
                className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-royal-gold/70 to-transparent z-10"
                aria-hidden="true"
              />
              <div className="relative w-full aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={HERO_YOUTUBE_EMBED}
                  title="Storybook Photos — featured video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="mt-3 text-center text-royal-cream/55 text-sm">
              Watch the Storybook Photos experience
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
