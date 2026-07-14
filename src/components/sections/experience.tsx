"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Camera, BookOpen, Sparkles } from "lucide-react";
import { IDENTITY_TRUTHS } from "@/lib/constants";

const features = [
  {
    icon: Sparkles,
    title: "Immersive Kingdom Sets",
    description:
      "Four thoughtfully crafted environments — throne room, forest, garden, and courage quest — designed to help children feel brave, special, and full of wonder.",
  },
  {
    icon: Camera,
    title: "Portraits with Purpose",
    description:
      "Our photographers capture joy, courage, and belonging — helping shy kids shine as the beloved children they already are.",
  },
  {
    icon: BookOpen,
    title: "Kingdom Chronicles",
    description:
      "Personalized books where your child is the hero — loved, brave, and made for adventure.",
  },
  {
    icon: Heart,
    title: "Confidence That Lasts",
    description:
      "Memories that help kids stand taller. These keepsakes remind families of the magic of childhood for years.",
  },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24 bg-enchanted-cream overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
          {/* Little girl fairy — left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center lg:justify-start order-first"
          >
            <div className="relative w-full max-w-[380px] lg:max-w-none">
              <Image
                src="/characters/fairy-girl.webp"
                alt="Young fairy girl with flower crown and lantern — Storybook Photos"
                width={865}
                height={938}
                className="w-full h-auto object-contain drop-shadow-2xl"
                sizes="(max-width: 1024px) 380px, 460px"
              />
            </div>
          </motion.div>

          {/* Intro copy — right of character */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <div className="ornament-line mb-3 lg:justify-start" aria-hidden="true">
              <span className="text-royal-gold/70 text-[10px] tracking-[0.35em]">
                ✦
              </span>
            </div>
            <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
              The Experience
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-4">
              Where Wonder Becomes Memory
            </h1>
            <p className="text-royal-blue/60 text-lg max-w-xl mx-auto lg:mx-0">
              Step into our Costa Mesa studio and help your child feel like
              royalty — with portraits and storybooks that build lasting
              confidence and joy.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {IDENTITY_TRUTHS.map((truth, index) => (
            <motion.div
              key={truth.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="p-6 rounded-2xl bg-white text-royal-blue border border-royal-gold/25 shadow-sm"
            >
              <p className="text-royal-gold text-xs tracking-widest uppercase mb-2">
                {truth.label}
              </p>
              <h3 className="font-serif text-lg font-bold mb-2">{truth.title}</h3>
              <p className="text-royal-blue/65 text-sm leading-relaxed">
                {truth.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-white border border-royal-gold/20 hover:border-royal-gold/50 hover:shadow-lg hover:shadow-royal-gold/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-royal-gold/10 group-hover:bg-royal-gold/20 flex items-center justify-center mb-4 transition-colors">
                <feature.icon className="h-6 w-6 text-royal-gold" />
              </div>
              <h3 className="font-serif text-xl font-bold text-royal-blue mb-2">
                {feature.title}
              </h3>
              <p className="text-royal-blue/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
