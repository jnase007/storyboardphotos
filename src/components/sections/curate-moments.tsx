"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { SectionOrnament } from "@/components/section-ornament";

export function CurateMomentsSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-enchanted-cream overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-royal-gold/45 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-royal-cream to-transparent"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10"
          >
            <SectionOrnament />
            <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
              Personalized for them
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-4">
              We Curate Every Moment for Your Child
            </h2>
            <p className="text-royal-blue/65 text-lg leading-relaxed max-w-2xl mx-auto">
              Before you arrive, we learn everything about your child — their
              personality, their favorite story, what makes them light up. When
              you walk through the door, we've already built the day around
              them. You experience the magic. We handle everything else.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-royal-gold/35 bg-white/85 backdrop-blur-sm p-8 sm:p-10 shadow-xl shadow-royal-gold/10"
          >
            <div
              className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-royal-gold/60 to-transparent"
              aria-hidden="true"
            />
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-royal-gold/15 mb-5 ring-1 ring-royal-gold/30">
              <Heart className="h-6 w-6 text-royal-gold" />
            </div>

            <ul className="space-y-4 mb-8 text-base text-royal-blue/80">
              <li className="flex gap-3">
                <span className="text-royal-gold mt-0.5">✦</span>
                <span>Which quest speaks to your child's heart?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-royal-gold mt-0.5">✦</span>
                <span>What do you want them to believe about themselves?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-royal-gold mt-0.5">✦</span>
                <span>What should we know to make this day unforgettable?</span>
              </li>
            </ul>

            <Link
              href="/book"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-base font-semibold text-royal-blue hover:bg-[#D4B480] transition-all hover:scale-[1.02]"
            >
              Begin Their Quest
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
