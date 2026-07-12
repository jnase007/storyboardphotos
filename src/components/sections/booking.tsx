"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookingForm } from "@/components/booking-form";
import { KINGDOM_SETS } from "@/lib/constants";


const QUESTS = [
  { id: "dragon-slayer", num: 1, title: "Slay the Dragon", desc: "Face the great dragon with courage — and discover that bravery can turn a foe into a friend.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/dragon-slayer.jpg" },
  { id: "rescue-mission", num: 2, title: "Rescue Mission", desc: "Someone needs help! Race through the kingdom to rescue friends and bring them safely home.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/rescue-mission.jpg" },
  { id: "lost-crown", num: 3, title: "Find the Crown", desc: "The royal crown is missing! Follow clues across the kingdom to bring it home.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/lost-crown.jpg" },
  { id: "forest-guardian", num: 4, title: "Forest Guardian", desc: "The enchanted forest needs a protector. Defend the creatures and restore the magic.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/forest-guardian.jpg" },
  { id: "kindness-quest", num: 5, title: "Kindness Quest", desc: "A lonely corner of the kingdom needs warmth. Heal hearts with courage and kindness.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/kindness-quest.jpg" },
  { id: "light-treasure", num: 6, title: "Treasure of Light", desc: "The kingdom\'s light has been stolen! Recover the treasure and bring the glow home.", image: "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/adventure-cards/light-treasure.jpg" },
];

export function BookingSection() {
  // Launch: only Forest Garden sets are selectable
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([
    "royal-forest",
    "royal-garden",
  ]);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);

  function toggleSet(id: string, available: boolean) {
    if (!available) return;
    setSelectedSetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <section id="book" className="py-24 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Launch set notice */}
        <div className="max-w-3xl mx-auto mb-10">
          <div
            className="rounded-2xl border px-5 py-4 text-center"
            style={{
              background: "linear-gradient(135deg, #F8F4EC 0%, #fff 100%)",
              borderColor: "rgba(185,138,25,0.35)",
            }}
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-royal-gold mb-1">
              Now booking
            </p>
            <p className="font-serif text-xl font-bold text-royal-blue">
              Forest Garden Experience
            </p>
            <p className="text-sm text-royal-blue/65 mt-1.5 leading-relaxed">
              Only{" "}
              <span className="font-semibold text-royal-blue">Royal Forest</span>{" "}
              &{" "}
              <span className="font-semibold text-royal-blue">Royal Garden</span>{" "}
              can be selected right now. Throne Room and Chastle stay visible as
              coming soon.
            </p>
          </div>
        </div>

        {/* Kingdom set selector — show all, only open sets selectable */}
        <div className="max-w-4xl mx-auto mb-14">
          <h3 className="text-center font-serif text-2xl font-bold text-royal-blue mb-2">
            Choose Your Kingdom Sets
          </h3>
          <p className="text-center text-royal-blue/50 text-sm mb-6">
            All four will be part of the full kingdom — only open sets can be
            selected for booking today.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {KINGDOM_SETS.map((set) => {
              const selected = selectedSetIds.includes(set.id);
              const available = set.available;
              return (
                <button
                  key={set.id}
                  type="button"
                  disabled={!available}
                  onClick={() => toggleSet(set.id, available)}
                  className="rounded-xl overflow-hidden text-left transition-all relative"
                  style={{
                    border: selected
                      ? "2px solid #B98A19"
                      : available
                        ? "2px solid #e5e7eb"
                        : "2px solid #e8e4dc",
                    background: selected ? "#F8F4EC" : "white",
                    boxShadow: selected
                      ? "0 0 0 3px rgba(185,138,25,0.15)"
                      : "none",
                    cursor: available ? "pointer" : "not-allowed",
                    opacity: available ? 1 : 0.78,
                  }}
                  aria-disabled={!available}
                  aria-pressed={selected}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <Image
                      src={set.image}
                      alt={set.name}
                      fill
                      className={`object-cover ${available ? "" : "grayscale-[40%]"}`}
                    />
                    <span
                      className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{
                        background: available ? "#059669" : "#0A1628",
                        color: available ? "white" : "#C5A26F",
                        border: available ? "none" : "1px solid rgba(197,162,111,0.45)",
                      }}
                    >
                      {available ? (selected ? "Selected" : "Open now") : "Coming soon"}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-sm" style={{ color: "#0A1628" }}>
                      {set.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {available
                        ? set.description
                        : "Coming soon — not selectable yet"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quest Selector */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-center font-serif text-2xl font-bold text-royal-blue mb-2">
            Choose Your Quest
          </h3>
          <p className="text-center text-royal-blue/50 text-sm mb-8">
            The child picks how their story goes (1 of 6) — photos are captured in
            Forest & Garden while we build the full kingdom.
          </p>
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
            Tell us about your child and we&apos;ll handle everything. We curate the day around them —
            their adventure, their story, their Kingdom Quest book. You simply show up and experience the magic.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl border border-royal-gold/20 p-6 sm:p-8 lg:p-10 shadow-lg">
            <BookingForm
              selectedSetLabels={KINGDOM_SETS.filter((s) =>
                selectedSetIds.includes(s.id)
              ).map((s) => s.name)}
              selectedQuestId={selectedQuest}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
