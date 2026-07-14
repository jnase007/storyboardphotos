"use client";

import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Camera,
  BookOpen,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Crown,
  Sparkles,
  Camera,
  BookOpen,
  Gift,
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-enchanted-night relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal-gold/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            How It Works
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-cream mb-4">
            Your Royal Journey
          </h1>
          <p className="text-royal-cream/60 text-lg">
            From first click to heirloom delivery — five simple steps to a
            keepsake that builds lasting confidence and wonder.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {HOW_IT_WORKS.map((step, index) => {
            const Icon = iconMap[step.icon] ?? Crown;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="glass-card rounded-2xl p-6 h-full hover:border-royal-gold/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-royal-gold text-royal-blue text-sm font-bold">
                      {step.step}
                    </span>
                    <Icon className="h-5 w-5 text-royal-gold" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-royal-cream mb-2">
                    {step.title}
                  </h3>
                  <p className="text-royal-cream/60 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-royal-gold/30" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
