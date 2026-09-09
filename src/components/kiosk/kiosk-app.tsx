"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Film,
  RotateCcw,
  Sparkles,
  Crown,
} from "lucide-react";
import {
  ADVENTURE_PATHS,
  type AdventurePath,
  type AdventurePathId,
} from "@/lib/storybook/adventure-paths";

const IDLE_RESET_MS = 90_000;

const ATTRACT_VIDEO = "/brand/homepage-hero-promo.mp4";

const QUEST_ART: Record<AdventurePathId, string> = {
  "dragon-slayer": "/adventure-cards/dragon-slayer.jpg",
  "rescue-mission": "/adventure-cards/rescue-mission.jpg",
  "lost-crown": "/adventure-cards/lost-crown.jpg",
  "forest-guardian": "/adventure-cards/forest-guardian.jpg",
  "kindness-quest": "/adventure-cards/kindness-quest.jpg",
  "light-treasure": "/adventure-cards/light-treasure.jpg",
};

type Step = "attract" | "choose" | "name" | "product" | "confirm";
type Gender = "girl" | "boy";
type Product = "book" | "movie" | "both";

type KioskSelection = {
  path: AdventurePath;
  childName: string;
  gender: Gender;
  product: Product;
  savedAt: string;
};

function softClick(freq = 660) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.045;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
    osc.stop(ctx.currentTime + 0.18);
    window.setTimeout(() => ctx.close(), 250);
  } catch {
    // optional
  }
}

function productLabel(product: Product) {
  if (product === "book") return "Storybook";
  if (product === "movie") return "Kingdom Movie";
  return "Storybook + Movie";
}

export function KioskApp() {
  const paths = useMemo(() => ADVENTURE_PATHS, []);
  const [step, setStep] = useState<Step>("attract");
  const [selected, setSelected] = useState<AdventurePath | null>(null);
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState<Gender>("girl");
  const [product, setProduct] = useState<Product>("both");
  const [lastTouch, setLastTouch] = useState(() => Date.now());
  const [staffOpen, setStaffOpen] = useState(false);
  const [history, setHistory] = useState<KioskSelection[]>([]);

  const bump = useCallback(() => setLastTouch(Date.now()), []);

  const reset = useCallback(() => {
    setSelected(null);
    setChildName("");
    setGender("girl");
    setProduct("both");
    setStep("attract");
    setStaffOpen(false);
    bump();
  }, [bump]);

  // Load local session log for staff testing
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sbp-kiosk-selections");
      if (!raw) return;
      const parsed = JSON.parse(raw) as KioskSelection[];
      if (Array.isArray(parsed)) setHistory(parsed.slice(0, 20));
    } catch {
      // ignore
    }
  }, []);

  // Idle timeout
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() - lastTouch > IDLE_RESET_MS && step !== "attract") {
        reset();
      }
    }, 4_000);
    return () => window.clearInterval(id);
  }, [lastTouch, step, reset]);

  // Keep screen awake when possible
  useEffect(() => {
    let lock: { release: () => void } | null = null;
    const nav = navigator as Navigator & {
      wakeLock?: {
        request: (type: "screen") => Promise<{ release: () => void }>;
      };
    };
    nav.wakeLock
      ?.request("screen")
      .then((l) => {
        lock = l;
      })
      .catch(() => {});
    return () => {
      try {
        lock?.release();
      } catch {
        // ignore
      }
    };
  }, []);

  const saveSelection = (sel: KioskSelection) => {
    try {
      const next = [sel, ...history].slice(0, 30);
      setHistory(next);
      localStorage.setItem("sbp-kiosk-selections", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const confirmAll = () => {
    if (!selected || !childName.trim()) return;
    softClick(880);
    const sel: KioskSelection = {
      path: selected,
      childName: childName.trim(),
      gender,
      product,
      savedAt: new Date().toISOString(),
    };
    saveSelection(sel);
    setStep("confirm");
    bump();
  };

  const role = gender === "girl" ? "Queen" : "King";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#0b1524] text-royal-cream touch-manipulation select-none"
      onPointerDown={bump}
      onTouchStart={bump}
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,176,122,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,53,104,0.35),transparent_45%)]" />
      </div>

      {/* Hidden staff corner */}
      <button
        type="button"
        aria-label="Staff menu"
        className="absolute top-0 right-0 z-50 h-14 w-14 opacity-0"
        onClick={() => {
          setStaffOpen((v) => !v);
          bump();
        }}
      />

      {staffOpen ? (
        <div className="absolute top-4 right-4 z-50 w-[min(92vw,360px)] rounded-2xl border border-royal-gold/35 bg-[#122033]/95 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-royal-gold text-xs font-bold tracking-widest uppercase">
              Staff
            </p>
            <button
              type="button"
              className="text-sm text-royal-cream/60"
              onClick={() => setStaffOpen(false)}
            >
              Close
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mb-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-royal-gold text-sm font-bold text-royal-blue"
          >
            <RotateCcw className="h-4 w-4" />
            Reset kiosk
          </button>
          <p className="text-xs text-royal-cream/50 mb-2">
            Recent picks (this iPad)
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2 text-left">
            {history.length === 0 ? (
              <p className="text-sm text-royal-cream/40">None yet</p>
            ) : (
              history.slice(0, 8).map((h, i) => (
                <div
                  key={`${h.savedAt}-${i}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                >
                  <p className="font-semibold">
                    {h.gender === "girl" ? "Queen" : "King"} {h.childName}
                  </p>
                  <p className="text-royal-cream/65">
                    {h.path.label} · {productLabel(h.product)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {/* ATTRACT — cinematic loop */}
        {step === "attract" ? (
          <motion.button
            key="attract"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-10 overflow-hidden"
            onClick={() => {
              softClick();
              setStep("choose");
              bump();
            }}
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={ATTRACT_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1524] via-[#0b1524]/55 to-[#0b1524]/25" />
            <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-16 text-center sm:justify-center sm:pb-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-royal-gold/40 bg-royal-gold/15 px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-royal-gold backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Storybook Photos
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] max-w-4xl drop-shadow-lg">
                Choose Your
                <span className="block text-gradient-gold-shine">Adventure</span>
              </h1>
              <p className="mt-5 max-w-xl text-base sm:text-xl text-royal-cream/80 leading-relaxed">
                Pick the quest. Enter your name. Create your book & movie.
              </p>
              <div className="mt-8 inline-flex items-center justify-center rounded-full bg-royal-gold px-10 py-5 text-xl font-bold text-royal-blue shadow-xl shadow-black/40 animate-pulse">
                Touch to Begin
              </div>
            </div>
          </motion.button>
        ) : null}

        {/* CHOOSE QUEST */}
        {step === "choose" ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-10 flex flex-col px-4 sm:px-7 py-4 sm:py-6"
          >
            <HeaderBar
              title="Which adventure calls to you?"
              eyebrow="Step 1 · Choose your quest"
              onBack={reset}
              onReset={reset}
            />

            <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paths.map((path, idx) => (
                <motion.button
                  key={path.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                  onClick={() => {
                    softClick(720);
                    setSelected(path);
                    setStep("name");
                    bump();
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-royal-gold/30 bg-royal-blue/40 text-left shadow-lg shadow-black/25 transition-transform active:scale-[0.985] hover:border-royal-gold/70"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={QUEST_ART[path.id]}
                      alt=""
                      fill
                      className="object-cover scale-105 transition-transform duration-[4000ms] ease-out group-hover:scale-110"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1524] via-[#0b1524]/60 to-black/10" />
                  </div>
                  <div className="relative z-10 flex h-full min-h-[165px] sm:min-h-[210px] flex-col justify-end p-3.5 sm:p-5">
                    <span className="mb-2 inline-flex w-fit rounded-full bg-royal-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-royal-blue">
                      Quest {path.option}
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl font-bold leading-tight mb-1">
                      {path.label}
                    </h3>
                    <p className="text-royal-cream/75 text-xs sm:text-sm leading-snug line-clamp-3">
                      {path.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : null}

        {/* NAME */}
        {step === "name" && selected ? (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-10 flex flex-col px-4 sm:px-8 py-4 sm:py-6"
          >
            <HeaderBar
              title="Who is the hero?"
              eyebrow={`Step 2 · ${selected.label}`}
              onBack={() => {
                softClick();
                setStep("choose");
              }}
              onReset={reset}
            />

            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-full max-w-2xl rounded-3xl border border-royal-gold/30 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-royal-gold/40 shrink-0">
                    <Image
                      src={QUEST_ART[selected.id]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <p className="text-royal-gold text-xs font-semibold tracking-widest uppercase">
                      Selected quest
                    </p>
                    <p className="font-serif text-2xl font-bold">
                      {selected.title}
                    </p>
                  </div>
                </div>

                <label className="block text-sm font-semibold text-royal-cream/70 mb-2">
                  Child's first name
                </label>
                <input
                  value={childName}
                  onChange={(e) => {
                    setChildName(e.target.value);
                    bump();
                  }}
                  placeholder="Type their name"
                  autoCapitalize="words"
                  autoCorrect="off"
                  className="w-full h-16 rounded-xl border border-royal-gold/30 bg-[#0b1524]/70 px-5 text-2xl font-serif text-royal-cream placeholder:text-royal-cream/30 outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/30"
                />

                <p className="mt-6 mb-3 text-sm font-semibold text-royal-cream/70">
                  They are a…
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {(
                    [
                      { id: "girl", label: "Queen", icon: Crown },
                      { id: "boy", label: "King", icon: Crown },
                    ] as const
                  ).map((opt) => {
                    const active = gender === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          softClick(600);
                          setGender(opt.id);
                          bump();
                        }}
                        className={`h-16 rounded-xl border text-lg font-bold transition-all ${
                          active
                            ? "border-royal-gold bg-royal-gold text-royal-blue"
                            : "border-royal-gold/30 bg-white/5 text-royal-cream hover:bg-white/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={childName.trim().length < 2}
                  onClick={() => {
                    if (childName.trim().length < 2) return;
                    softClick(760);
                    setStep("product");
                    bump();
                  }}
                  className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-royal-gold text-lg font-bold text-royal-blue disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#D4B480]"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* PRODUCT */}
        {step === "product" && selected ? (
          <motion.div
            key="product"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-10 flex flex-col px-4 sm:px-8 py-4 sm:py-6"
          >
            <HeaderBar
              title={`What should ${childName.trim() || "they"} create?`}
              eyebrow="Step 3 · Book & movie"
              onBack={() => {
                softClick();
                setStep("name");
              }}
              onReset={reset}
            />

            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-full max-w-4xl grid sm:grid-cols-3 gap-4">
                {(
                  [
                    {
                      id: "book" as const,
                      title: "Storybook",
                      body: "Personalized hardcover Kingdom Chronicle",
                      icon: BookOpen,
                    },
                    {
                      id: "movie" as const,
                      title: "Kingdom Movie",
                      body: "Animated story film of their adventure",
                      icon: Film,
                    },
                    {
                      id: "both" as const,
                      title: "Book + Movie",
                      body: "The full royal experience",
                      icon: Sparkles,
                    },
                  ] as const
                ).map((opt) => {
                  const active = product === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        softClick(700);
                        setProduct(opt.id);
                        bump();
                      }}
                      className={`rounded-3xl border p-6 text-left transition-all min-h-[180px] ${
                        active
                          ? "border-royal-gold bg-royal-gold text-royal-blue shadow-xl shadow-royal-gold/20"
                          : "border-royal-gold/30 bg-white/5 text-royal-cream hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 mb-4 ${
                          active ? "text-royal-blue" : "text-royal-gold"
                        }`}
                      />
                      <p className="font-serif text-2xl font-bold mb-2">
                        {opt.title}
                      </p>
                      <p
                        className={`text-sm leading-relaxed ${
                          active ? "text-royal-blue/75" : "text-royal-cream/65"
                        }`}
                      >
                        {opt.body}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={confirmAll}
                className="inline-flex h-14 min-w-[240px] items-center justify-center rounded-xl bg-royal-gold px-8 text-lg font-bold text-royal-blue hover:bg-[#D4B480]"
              >
                Lock In Adventure
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* CONFIRM */}
        {step === "confirm" && selected ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center"
          >
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-royal-gold/40 shadow-2xl">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={QUEST_ART[selected.id]}
                  alt={selected.title}
                  fill
                  className="object-cover"
                  sizes="900px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1524] via-[#0b1524]/55 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <p className="text-royal-gold font-semibold tracking-[0.18em] uppercase text-xs sm:text-sm mb-2">
                  Adventure locked
                </p>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-2">
                  {role} {childName}
                </h2>
                <p className="font-serif text-xl sm:text-2xl text-royal-cream/90 mb-2">
                  {selected.title}
                </p>
                <p className="text-royal-cream/70 text-sm sm:text-base mb-6">
                  {productLabel(product)} · Tell a team member to begin
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      softClick();
                      setStep("product");
                    }}
                    className="inline-flex h-12 items-center justify-center rounded-md border border-royal-gold/40 bg-white/5 px-6 font-semibold hover:bg-white/10"
                  >
                    Edit choice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      softClick(520);
                      reset();
                    }}
                    className="inline-flex h-12 items-center justify-center rounded-md bg-royal-gold px-6 font-bold text-royal-blue hover:bg-[#D4B480]"
                  >
                    Done · Next family
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function HeaderBar({
  title,
  eyebrow,
  onBack,
  onReset,
}: {
  title: string;
  eyebrow: string;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
      <button
        type="button"
        onClick={() => {
          softClick();
          onBack();
        }}
        className="inline-flex h-12 items-center gap-2 rounded-full border border-royal-gold/30 bg-white/5 px-4 text-sm font-semibold text-royal-cream/85 hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="text-center min-w-0">
        <p className="text-royal-gold text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h2 className="font-serif text-xl sm:text-3xl font-bold truncate">
          {title}
        </h2>
      </div>
      <button
        type="button"
        onClick={() => {
          softClick();
          onReset();
        }}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-royal-gold/30 bg-white/5 text-royal-cream/85 hover:bg-white/10"
        aria-label="Reset kiosk"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
