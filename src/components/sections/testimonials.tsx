"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-enchanted-night">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            Testimonials
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-cream mb-4">
            Families Who Found Confidence
          </h2>
          <p className="text-royal-cream/60 text-lg">
            Hear from parents whose children left standing taller — reminded
            they are children of the King.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-8 relative"
            >
              <Quote className="h-8 w-8 text-royal-gold/30 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-royal-gold text-royal-gold"
                  />
                ))}
              </div>
              <p className="text-royal-cream/80 leading-relaxed mb-6 text-sm">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div>
                <p className="font-serif font-bold text-royal-cream">
                  {testimonial.name}
                </p>
                <p className="text-royal-cream/50 text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
