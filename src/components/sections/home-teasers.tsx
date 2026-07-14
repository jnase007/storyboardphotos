"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { SectionOrnament } from "@/components/section-ornament";

const teasers: Record<string, string> = {
  "/experience": "Immersive sets and portraits that build lasting confidence.",
  "/how-it-works": "Five simple steps from booking to heirloom delivery.",
  "/kingdom-sets": "Four enchanted worlds for your child's royal adventure.",
  "/storybooks": "Personalized storybooks where your child is the hero.",
  "/pricing":
    "Royal Portrait $450 · Kingdom Adventure $750 · Heirloom Legacy $1,200",
  "/testimonials": "Families whose kids left standing taller in who they are.",
  "/faq": "Answers about sessions, storybooks, and our Costa Mesa studio.",
};

export function HomeTeasers() {
  return (
    <section className="relative py-24 bg-enchanted-cream overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-royal-cream to-transparent"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <SectionOrnament />
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            Explore the Kingdom
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-royal-blue mb-4">
            Choose Your Path
          </h2>
          <p className="text-royal-blue/60 text-lg">
            Explore our sets, compare packages, and book a kingdom adventure
            your child will never forget.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Path cards */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {NAV_LINKS.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="group relative flex flex-col h-full rounded-2xl border border-royal-gold/25 bg-white/80 backdrop-blur-sm p-6 hover:border-royal-gold/55 hover:shadow-xl hover:shadow-royal-gold/15 transition-all duration-300"
                >
                  <div
                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-royal-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                  <h3 className="font-serif text-xl font-bold text-royal-blue mb-2 group-hover:text-royal-gold transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-royal-blue/60 text-sm leading-relaxed flex-1 mb-4">
                    {teasers[link.href]}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-royal-gold">
                    Learn more
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Large prince portrait */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center lg:justify-end order-first lg:order-last"
          >
            <div className="relative w-full max-w-[420px] lg:max-w-none">
              <Image
                src="/characters/prince-boy.webp"
                alt="Young prince in royal blue cape and crown — Storybook Photos"
                width={615}
                height={840}
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
                sizes="(max-width: 1024px) 380px, 480px"
              />
              {/* Soft gold line at eye level */}
              <div
                className="pointer-events-none absolute z-0 left-[55%] right-[-6%] top-[18%] h-px bg-gradient-to-r from-royal-gold/70 via-royal-gold/35 to-transparent"
                aria-hidden="true"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 max-w-6xl mx-auto"
        >
          <Link
            href="/book"
            className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-enchanted-night border border-royal-gold/35 p-8 hover:border-royal-gold/70 glow-gold transition-all"
          >
            <div>
              <h3 className="font-serif text-2xl font-bold text-royal-cream mb-1">
                Book Your Session
              </h3>
              <p className="text-royal-cream/60 text-sm">
                Reserve a kingdom quest that reminds your child they are royalty
                — brave, beloved, and full of wonder.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-royal-gold text-royal-blue font-semibold text-sm group-hover:bg-[#D4B480] transition-colors">
              Book Now
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
