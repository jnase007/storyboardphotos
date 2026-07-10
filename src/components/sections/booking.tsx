"use client";

import { motion } from "framer-motion";
import { BookingForm } from "@/components/booking-form";

export function BookingSection() {
  return (
    <section id="book" className="py-24 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            Book Your Session
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-4">
            Begin Their Kingdom Quest
          </h2>
          <p className="text-royal-blue/60 text-lg">
            Reserve your session and share a few simple details — we&apos;ll
            guide the adventure and create the heirloom storybook when you
            arrive.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl border border-royal-gold/20 p-6 sm:p-8 lg:p-10 shadow-lg">
            <BookingForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
