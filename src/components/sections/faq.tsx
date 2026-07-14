"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/constants";

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            FAQ
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-blue mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-royal-blue/60">
            Everything you need to know before your royal adventure.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6"
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-serif text-royal-blue hover:text-royal-gold">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-royal-blue/70 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex justify-center lg:justify-end order-first lg:order-last"
          >
            {/* Larger portrait treatment — matches homepage prince scale */}
            <div className="relative w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[320px]">
              <Image
                src="/characters/princess-girl.webp"
                alt="Young princess in floral dress and crown — Storybook Photos"
                width={565}
                height={905}
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
                sizes="(max-width: 640px) 300px, (max-width: 1024px) 380px, 460px"
                priority
              />
              {/* Soft gold line at eye level, extending to the right */}
              <div
                className="pointer-events-none absolute z-0 left-[58%] right-[-8%] top-[22%] h-px bg-gradient-to-r from-royal-gold/70 via-royal-gold/35 to-transparent"
                aria-hidden="true"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
