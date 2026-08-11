"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Film, BookOpen, Shirt, Share2, Star } from "lucide-react";
import { PRICING_PACKAGES, TESTIMONIALS, SITE } from "@/lib/constants";
import { SectionOrnament } from "@/components/section-ornament";

/** Raelyn 2.5 gold cut — full-motion sales sample (do not overwrite source). */
export const GOLD_MOVIE_URL =
  "https://v3b.fal.media/files/b/0aa5eca0/nkWza6XpxygmavrUqsq0s_final-upload.mp4";

/** Main still for Raelyn sample movie (hero princess art Justin locked). */
export const GOLD_MOVIE_POSTER = "/brand/raelyn-movie-poster.jpg";

const SAMPLE_SPREADS = [
  {
    src: GOLD_MOVIE_POSTER,
    alt: "Raelyn as princess — Storybook Photos movie sample",
    caption: "Your child on the cover",
  },
  {
    src: "/sets/royal-forest.webp",
    alt: "Royal Forest storybook scene sample",
    caption: "Story pages from their quest",
  },
  {
    src: "/sets/throne-room.jpg",
    alt: "Throne Room portrait set sample",
    caption: "Studio portraits that feel royal",
  },
] as const;

export function HomeSellSection() {
  return (
    <>
      {/* Gold movie + sample spreads */}
      <section className="relative py-20 sm:py-24 bg-enchanted-night overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-royal-gold/50 to-transparent"
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <SectionOrnament />
            <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
              See the Magic
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-cream mb-4">
              Book. Movie. Memory.
            </h2>
            <p className="text-royal-cream/65 text-lg leading-relaxed">
              Watch a real animated Kingdom Movie — then flip sample spreads from
              the storybook your child stars in.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <div className="relative rounded-2xl overflow-hidden border border-royal-gold/35 shadow-2xl shadow-black/40 bg-black">
                <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-royal-gold px-3 py-1 text-xs font-bold text-royal-blue">
                  <Film className="h-3.5 w-3.5" />
                  Sample movie
                </div>
                <video
                  className="w-full aspect-video object-cover"
                  src={GOLD_MOVIE_URL}
                  controls
                  playsInline
                  preload="metadata"
                  poster={GOLD_MOVIE_POSTER}
                />
              </div>
              <p className="mt-3 text-center text-royal-cream/45 text-sm">
                Full-motion storybook film · Costa Mesa studio product sample
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="lg:col-span-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-royal-gold text-sm font-semibold uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                Sample spreads
              </div>
              {SAMPLE_SPREADS.map((s) => (
                <div
                  key={s.src}
                  className="flex gap-4 rounded-xl border border-royal-gold/20 bg-white/5 p-3 hover:border-royal-gold/40 transition-colors"
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-royal-blue/40">
                    <Image
                      src={s.src}
                      alt={s.alt}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="font-serif text-royal-cream font-semibold leading-snug">
                      {s.caption}
                    </p>
                    <p className="text-royal-cream/50 text-sm mt-1">
                      Personalized to your child
                    </p>
                  </div>
                </div>
              ))}
              <Link
                href="/storybooks"
                className="inline-flex items-center gap-2 text-royal-gold font-semibold text-sm hover:underline"
              >
                Explore storybooks
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Price anchor */}
      <section className="relative py-20 sm:py-24 bg-enchanted-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
              Simple packages
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-royal-blue mb-4">
              Books from $299 · Movies $199–$299
            </h2>
            <p className="text-royal-blue/60 text-lg">
              Transparent Storybook Photos pricing — studio session, hardcover
              keepsake, and optional animated movie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
            {PRICING_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-2xl p-6 border ${
                  pkg.popular
                    ? "bg-royal-blue border-royal-gold text-royal-cream shadow-lg"
                    : "bg-white border-royal-gold/25"
                }`}
              >
                {pkg.popular ? (
                  <p className="text-royal-gold text-xs font-bold uppercase tracking-wider mb-2">
                    Most popular
                  </p>
                ) : null}
                <h3
                  className={`font-serif text-xl font-bold mb-1 ${
                    pkg.popular ? "text-royal-cream" : "text-royal-blue"
                  }`}
                >
                  {pkg.name}
                </h3>
                <p
                  className={`font-serif text-3xl font-bold mb-3 ${
                    pkg.popular ? "text-royal-gold" : "text-royal-blue"
                  }`}
                >
                  ${pkg.price}
                </p>
                <p
                  className={`text-sm leading-relaxed mb-4 ${
                    pkg.popular ? "text-royal-cream/70" : "text-royal-blue/60"
                  }`}
                >
                  {pkg.description}
                </p>
                <Link
                  href={`/book?package=${pkg.id}`}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold ${
                    pkg.popular
                      ? "bg-royal-gold text-royal-blue hover:bg-[#D4B480]"
                      : "bg-royal-blue text-royal-cream hover:bg-royal-purple"
                  }`}
                >
                  Book now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl border border-royal-gold/30 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-serif text-xl font-bold text-royal-blue">
                Animated Kingdom Movie
              </p>
              <p className="text-royal-blue/60 text-sm mt-1">
                Full-motion story film · Standard $199–$249 · Premium $299
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-royal-gold/40 px-5 text-sm font-semibold text-royal-blue hover:bg-royal-cream"
            >
              Full pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="relative py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
                Made in Costa Mesa
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-royal-blue mb-4">
                A studio parents trust
              </h2>
              <p className="text-royal-blue/65 leading-relaxed mb-6">
                Storybook Photos is a kingdom photo studio in Orange County —
                costumes, sets, personalized books, and heirloom movies crafted
                with care at {SITE.address}.
              </p>
              <ul className="space-y-3 text-sm text-royal-blue/80 mb-8">
                <li className="flex gap-2">
                  <span className="text-royal-gold">✦</span>
                  Turnaround: books typically ready within days; movies after
                  art approval
                </li>
                <li className="flex gap-2">
                  <span className="text-royal-gold">✦</span>
                  Share link for grandparents — free with every book
                </li>
                <li className="flex gap-2">
                  <span className="text-royal-gold">✦</span>
                  Optional kingdom tee + reprints when you love the art
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/book"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-royal-gold px-6 text-base font-semibold text-royal-blue hover:bg-[#D4B480]"
                >
                  Create their story
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-royal-gold/40 px-6 text-base font-semibold text-royal-blue hover:bg-royal-cream"
                >
                  FAQ
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-royal-gold/20 bg-enchanted-cream/60 p-5"
                >
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-royal-gold text-royal-gold"
                      />
                    ))}
                  </div>
                  <p className="text-royal-blue/75 text-sm leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="font-serif font-bold text-royal-blue text-sm">
                    {t.name}
                  </p>
                  <p className="text-royal-blue/45 text-xs mt-0.5">{t.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: Share2,
                title: "Share with family",
                body: "Send grandma the digital book link the day it’s ready.",
              },
              {
                icon: Film,
                title: "Add the movie",
                body: "Full-motion film after you approve every page.",
              },
              {
                icon: Shirt,
                title: "Kingdom tee",
                body: "Optional merch from the approved white-tee art.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-royal-gold/20 bg-white p-5 text-center"
              >
                <item.icon className="h-5 w-5 text-royal-gold mx-auto mb-2" />
                <p className="font-serif font-bold text-royal-blue mb-1">
                  {item.title}
                </p>
                <p className="text-royal-blue/55 text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
