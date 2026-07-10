"use client";

import { motion } from "framer-motion";
import { StoryCharacter } from "@/components/story-character";

/** Friendly character parade — homepage strip between hero and teasers. */
export function CharacterParade() {
  return (
    <section className="relative bg-enchanted-cream py-10 sm:py-14 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-royal-gold font-medium tracking-widest uppercase text-xs sm:text-sm mb-8"
        >
          Welcome to the Kingdom
        </motion.p>
        <div className="flex items-end justify-center gap-2 sm:gap-6 md:gap-10 max-w-4xl mx-auto">
          {(
            [
              { id: "fairy" as const, w: 140, delay: 0 },
              { id: "prince" as const, w: 150, delay: 0.08 },
              { id: "queen" as const, w: 155, delay: 0.16 },
              { id: "king" as const, w: 160, delay: 0.24 },
            ] as const
          ).map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: c.delay, duration: 0.5 }}
              className="w-[22%] sm:w-[20%] max-w-[180px]"
            >
              <StoryCharacter id={c.id} width={c.w} float={false} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
