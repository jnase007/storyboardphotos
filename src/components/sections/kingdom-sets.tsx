"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Castle,
  Trees,
  Flower2,
  Shield,
  ArrowRight,
  Expand,
} from "lucide-react";
import { KINGDOM_SETS } from "@/lib/constants";
import { SectionOrnament } from "@/components/section-ornament";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const setIcons = [Castle, Trees, Flower2, Shield];
const setGradients = [
  "from-royal-blue to-royal-purple",
  "from-royal-emerald to-royal-blue",
  "from-royal-purple to-royal-gold/40",
  "from-royal-blue to-royal-emerald",
];

type KingdomSet = (typeof KINGDOM_SETS)[number];

export function KingdomSetsSection() {
  const [activeSet, setActiveSet] = useState<KingdomSet | null>(null);

  return (
    <section id="kingdom-sets" className="py-24 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <SectionOrnament />
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            The Kingdom Sets
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-4">
            Four Places to Remember Who They Are
          </h2>
          <p className="text-royal-blue/60 text-lg">
            Each set is crafted to help children feel brave, special, and full
            of wonder. Click any set to see it larger. Tell us which worlds
            speak to your child when you book.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {KINGDOM_SETS.map((set, index) => {
            const Icon = setIcons[index] ?? Castle;
            const hasPhoto = Boolean(set.image);

            return (
              <motion.button
                key={set.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => hasPhoto && setActiveSet(set)}
                className="group text-left rounded-2xl overflow-hidden border border-royal-gold/25 hover:border-royal-gold/55 transition-all hover:shadow-xl hover:shadow-royal-gold/15 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-royal-gold focus-visible:ring-offset-2"
                aria-label={`View larger photo of ${set.name}`}
              >
                <div
                  className={`aspect-[4/3] relative overflow-hidden ${
                    hasPhoto
                      ? "bg-royal-blue"
                      : `bg-gradient-to-br ${setGradients[index]}`
                  }`}
                >
                  {hasPhoto ? (
                    <>
                      <Image
                        src={set.image}
                        alt={set.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/50 via-transparent to-transparent" />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-royal-blue shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                        <Expand className="h-3 w-3 text-royal-gold" />
                        View larger
                      </span>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-16 w-16 text-royal-gold/40 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-royal-blue mb-1">
                    {set.name}
                  </h3>
                  <p className="text-royal-blue/60 text-sm leading-relaxed">
                    {set.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/book"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-base font-semibold text-royal-blue hover:bg-[#D4B480] transition-colors"
          >
            Tell Us How to Curate Your Session
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* Larger set photo modal */}
      <Dialog
        open={Boolean(activeSet)}
        onOpenChange={(open) => {
          if (!open) setActiveSet(null);
        }}
      >
        <DialogContent className="rounded-2xl border-2 border-royal-gold/40 bg-royal-blue p-0 overflow-hidden shadow-2xl shadow-black/40">
          {activeSet && (
            <>
                  <div className="relative w-full max-h-[55dvh] sm:max-h-none aspect-[4/3] sm:aspect-[16/10] bg-royal-blue/50">
                <Image
                  src={activeSet.image}
                  alt={activeSet.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1100px) 96vw, 1100px"
                  priority
                />
              </div>
              <div className="px-5 sm:px-7 py-5 border-t border-royal-gold/25">
                <DialogTitle>{activeSet.name}</DialogTitle>
                <DialogDescription className="mt-1.5">
                  {activeSet.description}
                </DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
