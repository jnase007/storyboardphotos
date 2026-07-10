"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Star, Feather } from "lucide-react";


const ADVENTURES = [
  {
    id: "dragon-slayer",
    title: "The Dragon Quest",
    label: "Slay the Dragon",
    description: "Face the great dragon with courage — and discover that bravery can turn a foe into a friend.",
    image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/dragon-slayer.jpg",
    color: "#C5A26F",
  },
  {
    id: "rescue-mission",
    title: "The Rescue Mission",
    label: "Save the Day",
    description: "Race through the kingdom to rescue friends and bring them safely home.",
    image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/rescue-mission.jpg",
    color: "#60a5fa",
  },
  {
    id: "lost-crown",
    title: "The Lost Crown",
    label: "Solve the Mystery",
    description: "Follow the clues across the kingdom and restore the crown's magical light.",
    image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/lost-crown.jpg",
    color: "#f59e0b",
  },
  {
    id: "forest-guardian",
    title: "The Forest Guardian",
    label: "Protect the Forest",
    description: "Restore magic to a wilting enchanted forest and become its brave guardian.",
    image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/forest-guardian.jpg",
    color: "#10b981",
  },
  {
    id: "kindness-quest",
    title: "The Kindness Quest",
    label: "Spread Kindness",
    description: "Journey through the village spreading kindness and light to everyone you meet.",
    image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/kindness-quest.jpg",
    color: "#ec4899",
  },
  {
    id: "light-treasure",
    title: "The Light Treasure",
    label: "Find the Treasure",
    description: "Follow the ancient map to discover a treasure that brings hope to the whole kingdom.",
    image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/light-treasure.jpg",
    color: "#a78bfa",
  },
] as const;


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
        {/* ── Adventure Paths ── */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-royal-gold mb-4">
              Choose Your Adventure
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Six unique story paths — each one celebrates your child as the hero of their own kingdom quest.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
            {ADVENTURES.map((adv, i) => (
              <motion.div
                key={adv.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden group"
                style={{ border: `1px solid ${adv.color}30`, background: "rgba(10,22,40,0.6)" }}
              >
                <div className="aspect-square overflow-hidden relative">
                  <Image src={adv.image} alt={adv.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(10,22,40,0.8))" }} />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${adv.color}25`, color: adv.color, border: `1px solid ${adv.color}40` }}>
                      {adv.label}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-bold text-lg text-white mb-1">{adv.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{adv.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="/book" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-royal-blue transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #C5A26F, #d4a843)" }}>
              Book Your Session &rarr;
            </a>
          </div>
        </div>
    </section>
  );
}
