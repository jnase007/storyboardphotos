"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star, Heart, ArrowRight } from "lucide-react";
import {
  PRICING_PACKAGES,
  ADDITIONAL_INVESTMENTS,
  OUR_PROMISE,
} from "@/lib/constants";

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-24 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14 sm:mb-16"
        >
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            Pricing & Packages
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-4">
            Choose Your Royal Quest
          </h1>
          <p className="text-royal-blue/60 text-lg">
            Transparent session packages with a free portrait included. Add
            heirloom art only if you love what you see — never any obligation.
          </p>
        </motion.div>

        {/* Package cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
          {PRICING_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col rounded-2xl p-7 sm:p-8 ${
                pkg.popular
                  ? "bg-royal-blue text-royal-cream border-2 border-royal-gold shadow-xl shadow-royal-gold/25 md:-mt-2 md:mb-2 md:scale-[1.02] z-10"
                  : "bg-white border border-royal-gold/25 shadow-sm"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-royal-gold text-royal-blue text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md">
                  <Star className="h-3.5 w-3.5 fill-royal-blue" />
                  Most Popular
                </div>
              )}

              <h3
                className={`font-serif text-2xl font-bold mb-2 ${
                  pkg.popular ? "text-royal-cream" : "text-royal-blue"
                }`}
              >
                {pkg.name}
              </h3>
              <p
                className={`text-sm mb-5 leading-relaxed ${
                  pkg.popular ? "text-royal-cream/65" : "text-royal-blue/60"
                }`}
              >
                {pkg.description}
              </p>

              <div className="mb-6 flex items-baseline gap-1">
                <span
                  className={`font-serif text-5xl font-bold tracking-tight ${
                    pkg.popular ? "text-royal-gold" : "text-royal-blue"
                  }`}
                >
                  ${pkg.price.toLocaleString()}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        pkg.popular ? "text-royal-gold" : "text-royal-emerald"
                      }`}
                    />
                    <span
                      className={
                        pkg.popular
                          ? "text-royal-cream/85"
                          : "text-royal-blue/75"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/book?package=${pkg.id}`}
                className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-6 text-base font-semibold transition-colors ${
                  pkg.popular
                    ? "bg-royal-gold text-royal-blue hover:bg-[#D4B480]"
                    : "bg-royal-blue text-royal-cream hover:bg-royal-purple border border-royal-gold/30"
                }`}
              >
                Book Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Investments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="text-center mb-10">
            <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
              À La Carte
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue">
              Additional Investments
            </h3>
          </div>

          <div className="rounded-2xl border border-royal-gold/25 bg-white overflow-hidden shadow-sm">
            <ul className="divide-y divide-royal-gold/15">
              {ADDITIONAL_INVESTMENTS.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-6 py-4 hover:bg-royal-cream/50 transition-colors"
                >
                  <span className="text-royal-blue font-medium">
                    {item.label}
                  </span>
                  <span className="text-royal-gold font-serif font-semibold text-lg">
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Our Promise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-16 sm:mt-20"
        >
          <div className="rounded-2xl bg-royal-blue border border-royal-gold/30 p-8 sm:p-10 text-center shadow-lg shadow-royal-blue/20">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-royal-gold/15 mb-5">
              <Heart className="h-5 w-5 text-royal-gold" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-royal-cream mb-4">
              {OUR_PROMISE.headline}
            </h3>
            <p className="text-royal-gold text-lg font-medium mb-5 leading-relaxed">
              {OUR_PROMISE.body}
            </p>
            <p className="text-royal-cream/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {OUR_PROMISE.detail}
            </p>
            <Link
              href="/book"
              className="inline-flex mt-8 h-12 items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-base font-semibold text-royal-blue hover:bg-[#D4B480] transition-colors"
            >
              Book Your Session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
