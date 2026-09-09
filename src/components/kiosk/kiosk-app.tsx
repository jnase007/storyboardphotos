"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Film,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  ADVENTURE_PATHS,
  type AdventurePath,
  type AdventurePathId,
} from "@/lib/storybook/adventure-paths";

const IDLE_RESET_MS = 120_000;
/** H.264 + AAC — required for iPad Safari (AV1 will not play). */
const ATTRACT_VIDEO = "/brand/homepage-hero-promo.mp4?v=h264-2";
const ATTRACT_POSTER = "/brand/homepage-hero-promo-poster.jpg";
const PREVIEW_BEAT_MS = 2800;

const QUEST_ART: Record<AdventurePathId, string> = {
  "dragon-slayer": "/adventure-cards/dragon-slayer.jpg",
  "rescue-mission": "/adventure-cards/rescue-mission.jpg",
  "lost-crown": "/adventure-cards/lost-crown.jpg",
  "forest-guardian": "/adventure-cards/forest-guardian.jpg",
  "kindness-quest": "/adventure-cards/kindness-quest.jpg",
  "light-treasure": "/adventure-cards/light-treasure.jpg",
};

/** Cinematic preview frames per quest (until dedicated Seedance trailers ship). */
const QUEST_PREVIEW_FRAMES: Record<AdventurePathId, string[]> = {
  "dragon-slayer": [
    "/adventure-cards/dragon-slayer.jpg",
    "/adventure-cards/dragon-slayer-v22.jpg",
    "/adventure-cards/dragon-slayer-v21.jpg",
    "/adventure-cards/dragon-slayer-v20.jpg",
    "/adventure-cards/dragon-slayer-v18.jpg",
  ],
  "rescue-mission": [
    "/adventure-cards/rescue-mission.jpg",
    "/adventure-cards/rescue-mission-v22.jpg",
    "/adventure-cards/rescue-mission-v21.jpg",
    "/adventure-cards/rescue-mission-v20.jpg",
    "/adventure-cards/rescue-mission-v18.jpg",
  ],
  "lost-crown": [
    "/adventure-cards/lost-crown.jpg",
    "/adventure-cards/lost-crown-v22.jpg",
    "/adventure-cards/lost-crown-v21.jpg",
    "/adventure-cards/lost-crown-v20.jpg",
    "/adventure-cards/lost-crown-v18.jpg",
  ],
  "forest-guardian": [
    "/adventure-cards/forest-guardian.jpg",
    "/adventure-cards/forest-guardian-v22.jpg",
    "/adventure-cards/forest-guardian-v21.jpg",
    "/adventure-cards/forest-guardian-v20.jpg",
    "/adventure-cards/forest-guardian-v18.jpg",
  ],
  "kindness-quest": [
    "/adventure-cards/kindness-quest.jpg",
    "/adventure-cards/kindness-quest-v22.jpg",
    "/adventure-cards/kindness-quest-v21.jpg",
    "/adventure-cards/kindness-quest-v20.jpg",
    "/adventure-cards/kindness-quest-v18.jpg",
  ],
  "light-treasure": [
    "/adventure-cards/light-treasure.jpg",
    "/adventure-cards/light-treasure-v22.jpg",
    "/adventure-cards/light-treasure-v21.jpg",
    "/adventure-cards/light-treasure-v20.jpg",
    "/adventure-cards/light-treasure-v17.jpg",
  ],
};

type Step = "attract" | "name" | "choose" | "preview" | "product" | "confirm";
type Gender = "girl" | "boy";
type Product = "book" | "movie" | "both";

type KioskSelection = {
  pathId: AdventurePathId;
  pathLabel: string;
  pathTitle: string;
  childName: string;
  gender: Gender;
  product: Product;
  savedAt: string;
};

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  drift: number;
  shape: "rect" | "circle" | "ribbon";
};

const CONFETTI_COLORS = [
  "#D4B07A",
  "#F5E6C8",
  "#FFE8A3",
  "#FFFFFF",
  "#C9A227",
  "#E8C87A",
  "#8B5CF6",
  "#60A5FA",
];

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

function celebrateTone() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.08;
      osc.start(t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.stop(t + 0.3);
    });
    window.setTimeout(() => ctx.close(), 900);
  } catch {
    // optional
  }
}

function productLabel(product: Product) {
  if (product === "book") return "Storybook";
  if (product === "movie") return "Kingdom Movie";
  return "Storybook + Movie";
}

function storyBeats(path: AdventurePath, childName: string, role: string) {
  return path.pages
    .filter((p) => p.page > 1)
    .slice(0, 5)
    .map((p) => ({
      title: p.title
        .replace(/\[Name\]/g, childName)
        .replace(/\[Role\]/g, role),
      text: p.text
        .replace(/\[Name\]/g, childName)
        .replace(/\[Role\]/g, role)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160),
    }));
}

function makeConfetti(count = 90): ConfettiPiece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.45,
    duration: 2.4 + Math.random() * 1.8,
    rotate: Math.random() * 720 - 360,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 140,
    shape: (["rect", "circle", "ribbon"] as const)[id % 3],
  }));
}

function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(() => (active ? makeConfetti(110) : []), [active]);
  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[80] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{
            opacity: 1,
            y: -40,
            x: 0,
            rotate: 0,
            scale: 1,
          }}
          animate={{
            opacity: [1, 1, 0],
            y: ["0vh", "105vh"],
            x: p.drift,
            rotate: p.rotate,
            scale: [1, 0.9],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            left: `${p.left}%`,
            top: "-2%",
            width: p.shape === "ribbon" ? p.size * 0.35 : p.size,
            height: p.shape === "circle" ? p.size : p.size * 1.4,
            backgroundColor: p.color,
            borderRadius:
              p.shape === "circle"
                ? "999px"
                : p.shape === "ribbon"
                  ? "2px"
                  : "2px",
            position: "absolute",
            display: "block",
            boxShadow: "0 0 6px rgba(212,176,122,0.35)",
          }}
        />
      ))}
    </div>
  );
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
  const [previewFrame, setPreviewFrame] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"sent" | "local" | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const attractVideoRef = useRef<HTMLVideoElement>(null);
  const confettiTimer = useRef<number | null>(null);

  const bump = useCallback(() => setLastTouch(Date.now()), []);

  const fireConfetti = useCallback(() => {
    setConfettiOn(false);
    // Remount burst so animation restarts cleanly
    window.requestAnimationFrame(() => {
      setConfettiOn(true);
      celebrateTone();
      if (confettiTimer.current) window.clearTimeout(confettiTimer.current);
      confettiTimer.current = window.setTimeout(() => {
        setConfettiOn(false);
      }, 4200);
    });
  }, []);

  const reset = useCallback(() => {
    setSelected(null);
    setChildName("");
    setGender("girl");
    setProduct("both");
    setPreviewFrame(0);
    setSubmitting(false);
    setSubmitError(null);
    setEmailStatus(null);
    setConfettiOn(false);
    setStep("attract");
    setStaffOpen(false);
    bump();
  }, [bump]);

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

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() - lastTouch > IDLE_RESET_MS && step !== "attract") {
        reset();
      }
    }, 4_000);
    return () => window.clearInterval(id);
  }, [lastTouch, step, reset]);

  useEffect(() => {
    return () => {
      if (confettiTimer.current) window.clearTimeout(confettiTimer.current);
    };
  }, []);

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

  // Force attract loop on iPad Safari (autoplay is flaky even when muted).
  useEffect(() => {
    if (step !== "attract") return;
    const video = attractVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    const tryPlay = () => {
      const p = video.play();
      if (p) p.catch(() => {});
    };
    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    const onVis = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [step]);

  // Auto-advance cinematic preview frames
  useEffect(() => {
    if (step !== "preview" || !selected) return;
    const frames = QUEST_PREVIEW_FRAMES[selected.id] || [QUEST_ART[selected.id]];
    const id = window.setInterval(() => {
      setPreviewFrame((n) => (n + 1) % frames.length);
    }, PREVIEW_BEAT_MS);
    return () => window.clearInterval(id);
  }, [step, selected]);

  const saveSelection = (sel: KioskSelection) => {
    try {
      const next = [sel, ...history].slice(0, 30);
      setHistory(next);
      localStorage.setItem("sbp-kiosk-selections", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const confirmAll = async () => {
    if (!selected || !childName.trim() || submitting) return;
    softClick(880);
    setSubmitting(true);
    setSubmitError(null);

    const savedAt = new Date().toISOString();
    const sel: KioskSelection = {
      pathId: selected.id,
      pathLabel: selected.label,
      pathTitle: selected.title,
      childName: childName.trim(),
      gender,
      product,
      savedAt,
    };
    saveSelection(sel);

    // Celebrate immediately — don't wait on email
    fireConfetti();
    setStep("confirm");
    bump();

    try {
      const res = await fetch("/api/kiosk/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: childName.trim(),
          gender,
          product,
          adventureId: selected.id,
          adventureLabel: selected.label,
          adventureTitle: selected.title,
          adventureDescription: selected.description,
          bibleVerse: selected.bibleVerse,
          submittedAt: savedAt,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        emailed?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setEmailStatus("local");
        setSubmitError(json.error || "Saved on iPad — email may be delayed");
      } else {
        setEmailStatus(json.emailed ? "sent" : "local");
      }
    } catch {
      setEmailStatus("local");
      setSubmitError("Saved on iPad — email may be delayed");
    }

    setSubmitting(false);
  };

  const role = gender === "girl" ? "Queen" : "King";
  const heroLabel = childName.trim()
    ? `${role} ${childName.trim()}`
    : role;
  const frames = selected
    ? QUEST_PREVIEW_FRAMES[selected.id] || [QUEST_ART[selected.id]]
    : [];
  const beats = selected
    ? storyBeats(selected, childName.trim() || "the hero", role)
    : [];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#0b1524] text-royal-cream touch-manipulation select-none"
      onPointerDown={bump}
      onTouchStart={bump}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,176,122,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,53,104,0.35),transparent_45%)]" />
      </div>

      <ConfettiBurst active={confettiOn} />

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
                    {h.pathLabel} · {productLabel(h.product)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
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
              setStep("name");
              bump();
            }}
          >
            <video
              ref={attractVideoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={ATTRACT_VIDEO}
              poster={ATTRACT_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              controls={false}
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
                Meet the hero. Pick the quest. Create the book & movie.
              </p>
              <div className="mt-8 inline-flex items-center justify-center rounded-full bg-royal-gold px-10 py-5 text-xl font-bold text-royal-blue shadow-xl shadow-black/40 animate-pulse">
                Touch to Begin
              </div>
            </div>
          </motion.button>
        ) : null}

        {/* NAME first — so quest cards / previews can personalize boy/girl packs */}
        {step === "name" ? (
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
              eyebrow="Step 1 · Name & crown"
              onBack={reset}
              onReset={reset}
            />

            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-full max-w-2xl rounded-3xl border border-royal-gold/30 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
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
                      { id: "girl" as const, label: "Queen" },
                      { id: "boy" as const, label: "King" },
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
                    setStep("choose");
                    bump();
                  }}
                  className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-royal-gold text-lg font-bold text-royal-blue disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#D4B480]"
                >
                  Choose {childName.trim() || "their"} adventure
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

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
              title={`Which adventure calls to ${heroLabel}?`}
              eyebrow="Step 2 · Choose your quest"
              onBack={() => {
                softClick();
                setStep("name");
              }}
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
                    setPreviewFrame(0);
                    setStep("preview");
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

        {step === "preview" && selected ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-10 flex flex-col px-4 sm:px-7 py-4 sm:py-5"
          >
            <HeaderBar
              title={`${heroLabel}'s ${selected.label}`}
              eyebrow="Step 3 · Preview this story"
              onBack={() => {
                softClick();
                setSelected(null);
                setStep("choose");
              }}
              onReset={reset}
            />

            <div className="flex-1 min-h-0 grid lg:grid-cols-12 gap-4 lg:gap-6">
              <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-royal-gold/35 bg-black shadow-2xl min-h-[240px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={frames[previewFrame] || selected.id}
                    initial={{ opacity: 0.2, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={frames[previewFrame] || QUEST_ART[selected.id]}
                      alt={selected.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-royal-gold px-3 py-1 text-xs font-bold text-royal-blue">
                  <Film className="h-3.5 w-3.5" />
                  Story preview
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
                  {frames.map((f, i) => (
                    <div
                      key={f}
                      className={`h-1 flex-1 rounded-full ${
                        i === previewFrame ? "bg-royal-gold" : "bg-white/25"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col rounded-3xl border border-royal-gold/30 bg-white/5 p-5 sm:p-6 backdrop-blur-md overflow-hidden">
                <p className="text-royal-gold text-xs font-semibold tracking-[0.18em] uppercase mb-2">
                  What happens
                </p>
                <p className="text-royal-cream/85 text-base sm:text-lg leading-relaxed mb-4">
                  {selected.description}
                </p>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                  {beats.map((b, i) => (
                    <div
                      key={`${b.title}-${i}`}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
                    >
                      <p className="font-serif font-bold text-sm sm:text-base mb-0.5">
                        {i + 1}. {b.title}
                      </p>
                      <p className="text-royal-cream/60 text-xs sm:text-sm leading-snug line-clamp-2">
                        {b.text}
                      </p>
                    </div>
                  ))}
                </div>
                {selected.bibleVerse ? (
                  <p className="mt-3 text-royal-cream/45 text-xs">
                    {selected.bibleVerse}
                    {selected.bibleVerseText
                      ? ` — “${selected.bibleVerseText}”`
                      : ""}
                  </p>
                ) : null}

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      softClick(520);
                      setSelected(null);
                      setStep("choose");
                      bump();
                    }}
                    className="inline-flex h-14 items-center justify-center rounded-xl border border-royal-gold/40 bg-white/5 px-4 text-base font-semibold hover:bg-white/10"
                  >
                    Pick a different story
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      softClick(780);
                      setStep("product");
                      bump();
                    }}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-royal-gold px-4 text-base font-bold text-royal-blue hover:bg-[#D4B480]"
                  >
                    <Check className="h-5 w-5" />
                    Yes — this is the one
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

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
              eyebrow="Step 4 · Book & movie"
              onBack={() => {
                softClick();
                setStep("preview");
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
                disabled={submitting}
                onClick={() => {
                  void confirmAll();
                }}
                className="inline-flex h-14 min-w-[240px] items-center justify-center rounded-xl bg-royal-gold px-8 text-lg font-bold text-royal-blue hover:bg-[#D4B480] disabled:opacity-60"
              >
                {submitting ? "Locking in…" : "Lock In Adventure"}
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === "confirm" && selected ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, type: "spring", stiffness: 180 }}
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
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-royal-gold font-semibold tracking-[0.18em] uppercase text-xs sm:text-sm mb-2"
                >
                  ✨ Adventure locked!
                </motion.p>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-2">
                  {role} {childName}
                </h2>
                <p className="font-serif text-xl sm:text-2xl text-royal-cream/90 mb-2">
                  {selected.title}
                </p>
                <p className="text-royal-cream/70 text-sm sm:text-base mb-2">
                  {productLabel(product)} · Tell a team member to begin
                </p>
                <p className="text-royal-cream/45 text-xs sm:text-sm mb-6">
                  {emailStatus === "sent"
                    ? "Sent to justinnassie@gmail.com"
                    : emailStatus === "local"
                      ? "Saved on this iPad" +
                        (submitError ? ` · ${submitError}` : "")
                      : "Saving…"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      softClick();
                      setConfettiOn(false);
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
