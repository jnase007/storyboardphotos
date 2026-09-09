"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Film, BookOpen, Star } from "lucide-react";
import { TESTIMONIALS, SITE } from "@/lib/constants";
import { SectionOrnament } from "@/components/section-ornament";

/** Queen River gold cut — full-motion sales sample (best current homepage demo). */
export const GOLD_MOVIE_URL =
  "https://v3b.fal.media/files/b/0aa65cca/RtptzVPfjEdtKfnybbqqv_river-final-bgm.mp4";

/** Main still for River sample movie (Kingdom Race cover art). */
export const GOLD_MOVIE_POSTER = "/brand/river-movie-poster.jpg";

/** Full River sample storybook PDF for homepage featured area. */
export const GOLD_BOOK_PDF = "/brand/river-kingdom-quest-sample.pdf";

/** Cover card image for the sample PDF block. */
export const GOLD_BOOK_COVER = "/brand/river-sample-cover.jpg";

export const GOLD_SAMPLE_TITLE = "Queen River & the Kingdom Race";
export const GOLD_SAMPLE_ALT =
  "Queen River and the Kingdom Race — sample storybook";

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
              Watch a real animated Kingdom Movie — then open a full sample
              storybook your child can star in.
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
              className="lg:col-span-5"
            >
              <a
                href={GOLD_BOOK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-royal-gold/30 bg-white/5 hover:border-royal-gold/55 transition-colors"
              >
                <div className="relative aspect-[4/3] bg-royal-blue/40">
                  <Image
                    src={GOLD_BOOK_COVER}
                    alt={GOLD_SAMPLE_ALT}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 420px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/90 via-royal-blue/20 to-transparent" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-royal-gold px-3 py-1 text-xs font-bold text-royal-blue">
                    <BookOpen className="h-3.5 w-3.5" />
                    Sample book PDF
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-serif text-xl font-bold text-royal-cream mb-1">
                      {GOLD_SAMPLE_TITLE}
                    </p>
                    <p className="text-royal-cream/70 text-sm mb-3">
                      Full sample storybook — open the PDF
                    </p>
                    <span className="inline-flex items-center gap-2 text-royal-gold font-semibold text-sm">
                      View sample PDF
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </a>
              <p className="mt-3 text-center text-royal-cream/45 text-sm">
                Real personalized Kingdom Quest · your child is the hero
              </p>
            </motion.div>
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
        </div>
      </section>
    </>
  );
}
