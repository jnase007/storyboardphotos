"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookingForm } from "@/components/booking-form";


const QUESTS = [
  { id: "dragon-slayer", num: 1, title: "Slay the Dragon", desc: "Face the great dragon with courage — and discover that bravery can turn a foe into a friend.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/dragon-slayer.jpg" },
  { id: "rescue-mission", num: 2, title: "Rescue Mission", desc: "Someone needs help! Race through the kingdom to rescue friends and bring them safely home.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/rescue-mission.jpg" },
  { id: "lost-crown", num: 3, title: "Find the Crown", desc: "The royal crown is missing! Follow clues across the kingdom to bring it home.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/lost-crown.jpg" },
  { id: "forest-guardian", num: 4, title: "Forest Guardian", desc: "The enchanted forest needs a protector. Defend the creatures and restore the magic.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/forest-guardian.jpg" },
  { id: "kindness-quest", num: 5, title: "Kindness Quest", desc: "A lonely corner of the kingdom needs warmth. Heal hearts with courage and kindness.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/kindness-quest.jpg" },
  { id: "light-treasure", num: 6, title: "Treasure of Light", desc: "The kingdom\'s light has been stolen! Recover the treasure and bring the glow home.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/light-treasure.jpg" },
];

export function BookingSection() {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);

  return (
    <section id="book" className="py-24 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Quest Selector */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-center font-serif text-2xl font-bold text-royal-blue mb-2">
            Choose Your Quest
          </h3>
          <p className="text-center text-royal-blue/50 text-sm mb-8">The child picks how their story goes (1 of 6)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUESTS.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuest(q.id)}
                className="rounded-xl overflow-hidden text-left group transition-all"
                style={{
                  border: selectedQuest === q.id ? "2px solid #B98A19" : "2px solid #e5e7eb",
                  background: selectedQuest === q.id ? "#F8F4EC" : "white",
                  boxShadow: selectedQuest === q.id ? "0 0 0 3px rgba(185,138,25,0.15)" : "none",
                }}
              >
                <div className="aspect-square overflow-hidden relative">
                  <Image src={q.image} alt={q.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: selectedQuest === q.id ? "#B98A19" : "rgba(255,255,255,0.9)", color: selectedQuest === q.id ? "white" : "#0A1628" }}>
                    {q.num}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm" style={{ color: "#0A1628" }}>{q.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{q.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

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
