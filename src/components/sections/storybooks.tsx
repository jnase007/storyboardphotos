"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Star, Feather } from "lucide-react";

const storybookFeatures = [
  {
    icon: Feather,
    title: "Stories Written for Them",
    description:
      "Each storybook celebrates your child as the hero — loved, brave, and made for adventure.",
  },
  {
    icon: Star,
    title: "Museum-Quality Print",
    description:
      "Premium archival paper, lay-flat binding, and optional leather covers. Built to last generations.",
  },
  {
    icon: BookOpen,
    title: "Your Child as Royalty",
    description:
      "Professional portraits woven throughout the pages, with your child named and celebrated as the star of their own kingdom.",
  },
];

export function StorybooksSection() {
  return (
    <section id="storybooks" className="py-24 bg-enchanted-night relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
              Heirloom Storybooks
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-cream mb-6">
              A Story They&apos;ll
              <br />
              <span className="text-gradient-gold-shine">Never Forget</span>
            </h2>
            <p className="text-royal-cream/70 text-lg leading-relaxed mb-8">
              Beyond beautiful portraits, we craft personalized storybooks that
              help your child see themselves as royal, beloved, and made for
              adventure. Every page is illustrated with their professional
              photos — a keepsake that builds lasting confidence.
            </p>

            <div className="space-y-6">
              {storybookFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-royal-gold/20 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-royal-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-royal-cream mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-royal-cream/60 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              <div className="relative aspect-[1746/1920] overflow-hidden rounded-lg border-2 border-royal-gold/50 shadow-2xl shadow-black/40 bg-royal-blue/40 glow-lantern">
                <Image
                  src="/storybook-cover.webp"
                  alt="Personalized royal storybook cover from Storybook Photos"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 28rem"
                  priority
                />
              </div>
              <div className="absolute -right-3 top-3 bottom-3 w-full rounded-lg bg-royal-gold/10 border border-royal-gold/20 -z-10" />
              <div className="absolute -right-6 top-6 bottom-6 w-full rounded-lg bg-royal-gold/5 border border-royal-gold/10 -z-20" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
