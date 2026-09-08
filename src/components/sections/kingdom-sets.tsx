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
  ChevronLeft,
  ChevronRight,
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
  const [mapOpen, setMapOpen] = useState(false);

  function navigateSet(dir: 1 | -1) {
    if (!activeSet) return;
    const idx = KINGDOM_SETS.findIndex((s) => s.name === activeSet.name);
    const next = KINGDOM_SETS[(idx + dir + KINGDOM_SETS.length) % KINGDOM_SETS.length];
    setActiveSet(next);
  }

  const mainSet = KINGDOM_SETS[0];
  const moreSets = KINGDOM_SETS.slice(1);

  return (
    <section id="kingdom-sets" className="py-24 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <SectionOrnament />
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            The Kingdom Sets
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-4">
            Step Into the Throne Room
          </h1>
          <p className="text-royal-blue/60 text-lg">
            Our signature set is live in studio now. More enchanted worlds are
            coming — each crafted so kids feel brave, special, and full of wonder.
          </p>
        </motion.div>

        {/* Main featured set */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => setActiveSet(mainSet)}
          className="group w-full text-left rounded-3xl overflow-hidden border-2 border-royal-gold/40 hover:border-royal-gold/70 transition-all hover:shadow-2xl hover:shadow-royal-gold/20 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-royal-gold focus-visible:ring-offset-2 mb-16"
          aria-label={`View larger photo of ${mainSet.name}`}
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-royal-blue overflow-hidden">
            <Image
              src={mainSet.image}
              alt={mainSet.name}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/80 via-royal-blue/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center rounded-full bg-royal-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-royal-blue shadow-md">
                Main Set · Live Now
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex items-end justify-between gap-4">
              <div className="text-left">
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-1 drop-shadow-md">
                  {mainSet.name}
                </h2>
                <p className="text-white/85 text-sm sm:text-base max-w-xl drop-shadow">
                  {mainSet.description}
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-royal-blue shadow-sm shrink-0">
                <Expand className="h-3.5 w-3.5 text-royal-gold" />
                View larger
              </span>
            </div>
          </div>
        </motion.button>

        {/* More sets to come */}
        <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-royal-gold font-medium tracking-widest uppercase text-xs mb-1">
              Coming Soon
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue">
              More Sets to Come
            </h2>
          </div>
          <p className="text-royal-blue/55 text-sm max-w-md">
            These worlds are already in the kingdom map — studio builds and
            photos will expand here as each set opens.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {moreSets.map((set, index) => {
            const Icon = setIcons[index + 1] ?? Castle;
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
                      : `bg-gradient-to-br ${setGradients[index + 1]}`
                  }`}
                >
                  {hasPhoto ? (
                    <>
                      <Image
                        src={set.image}
                        alt={set.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/50 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 inline-flex rounded-full bg-royal-blue/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-royal-gold border border-royal-gold/30">
                        More to come
                      </span>
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
                />
                {/* Prev/Next arrows */}
                <button
                  onClick={() => navigateSet(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(10,22,40,0.7)", color: "#C5A26F", border: "1px solid rgba(197,162,111,0.4)" }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateSet(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(10,22,40,0.7)", color: "#C5A26F", border: "1px solid rgba(197,162,111,0.4)" }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {KINGDOM_SETS.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setActiveSet(s)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ background: s.name === activeSet.name ? "#C5A26F" : "rgba(197,162,111,0.3)" }}
                    />
                  ))}
                </div>
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

      {/* Kingdom Map */}
      <div className="mt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue mb-3">
            The Kingdom of Light
          </h3>
          <p className="text-royal-blue/60 mb-8 max-w-lg mx-auto">
            Your adventure takes you through these enchanted lands — each one waiting to become part of your story.
          </p>
          <div
            className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 cursor-zoom-in hover:scale-[1.02] transition-transform"
            style={{ borderColor: "#C5A26F33" }}
            onClick={() => setMapOpen(true)}
          >
            <Image
              src="https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kingdom-map.jpg"
              alt="Map of the Kingdom of Light"
              width={800}
              height={800}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 40px rgba(10,22,40,0.15)" }} />
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(10,22,40,0.7)", color: "#C5A26F" }}>
              Click to expand ✦
            </div>
          </div>

          {/* Map modal */}
          <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogContent className="max-w-4xl w-full p-2 rounded-2xl border-2" style={{ borderColor: "#C5A26F40", background: "#0A1628" }}>
              <DialogTitle className="sr-only">Map of the Kingdom of Light</DialogTitle>
              <DialogDescription className="sr-only">Full map of the Kingdom of Light showing all adventure locations</DialogDescription>
              <div className="relative w-full rounded-xl overflow-hidden">
                <Image
                  src="https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kingdom-map.jpg"
                  alt="Map of the Kingdom of Light"
                  width={1200}
                  height={1200}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center text-sm mt-2 pb-1" style={{ color: "#C5A26F99" }}>The Kingdom of Light — your adventure awaits</p>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </section>
  );
}
