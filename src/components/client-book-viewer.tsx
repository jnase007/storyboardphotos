"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Loader2,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

type StoryPage = {
  page: number;
  title: string;
  text: string;
  imageUrl?: string | null;
};

type Book = {
  id: string;
  child_name: string;
  child_age: number;
  gender: string;
  pages: StoryPage[];
  status: string;
  narration_url?: string | null;
  video_status?: string | null;
  video_url?: string | null;
  video_package?: string | null;
};

function BookPage({
  page,
  pageNum,
}: {
  page: StoryPage;
  pageNum: number;
}) {
  const skipTitles = [
    "Title Page",
    "The Dragon Quest",
    "The Rescue Mission",
    "The Lost Crown",
    "The Forest Guardian",
    "The Kindness Quest",
    "The Light Treasure",
    "The Kingdom of Light",
  ];
  const showTitle = page.title && !skipTitles.includes(page.title);

  return (
    <div className="flex flex-col h-full" style={{ background: "#F8F4EC" }}>
      <div className="flex-shrink-0" style={{ height: "60%" }}>
        {page.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.imageUrl}
            alt={page.title}
            className="w-full h-full object-contain bg-[#F8F1E3]"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "#0A1628" }}
          >
            <span className="text-5xl">👑</span>
          </div>
        )}
      </div>

      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent, #C5A26F, transparent)",
        }}
      />

      <div className="flex-1 overflow-hidden p-4 flex flex-col">
        {showTitle && (
          <h3
            className="font-bold text-sm mb-2"
            style={{ color: "#B98A19", fontFamily: "Georgia, serif" }}
          >
            {page.title}
          </h3>
        )}
        <p
          className="text-xs leading-relaxed flex-1 overflow-hidden"
          style={{ color: "#0A1628", fontFamily: "Georgia, serif" }}
        >
          {page.text}
        </p>
        <div className="text-center mt-2">
          <span className="text-xs italic" style={{ color: "#B98A19" }}>
            {pageNum}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ClientBookViewer({ book }: { book: Book }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [videoStatus, setVideoStatus] = useState(book.video_status ?? "none");
  const [videoUrl, setVideoUrl] = useState(book.video_url ?? null);
  const [requesting, setRequesting] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalPages = book.pages.length;
  const role = book.gender === "boy" ? "King" : "Queen";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [book.narration_url]);

  const pagesPerSpread = isMobile ? 1 : 2;
  const totalSpreads = Math.ceil(totalPages / pagesPerSpread);
  const leftPageIdx = spreadIndex * pagesPerSpread;
  const rightPageIdx = leftPageIdx + 1;
  const leftPage = book.pages[leftPageIdx];
  const rightPage = book.pages[rightPageIdx];

  async function toggleNarration() {
    if (!book.narration_url) {
      toast.message("Narration coming soon for this book");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      toast.error("Could not play narration");
    }
  }

  async function requestMovie() {
    setRequesting(true);
    try {
      const res = await fetch(`/api/storybooks/${book.id}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: "full",
          contact_name: contactName || null,
          contact_email: contactEmail || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setVideoStatus(data.video_status || "requested");
      setShowMovieForm(false);
      toast.success("Movie requested! We'll create your storybook reading.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setRequesting(false);
    }
  }

  const movieReady = Boolean(videoUrl);
  const movieRequested =
    videoStatus === "requested" ||
    videoStatus === "paid" ||
    videoStatus === "in_production";

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A1628 0%, #2D1B4E 100%)",
        minHeight: "100dvh",
        height: "100dvh",
        padding: isMobile ? "12px 8px" : "16px 12px",
        boxSizing: "border-box",
      }}
    >
      {book.narration_url ? (
        <audio ref={audioRef} src={book.narration_url} preload="none" />
      ) : null}

      <div className="text-center mb-2 sm:mb-3 shrink-0">
        <h1
          className="text-lg sm:text-xl font-bold"
          style={{ color: "#C5A26F", fontFamily: "Georgia, serif" }}
        >
          {role} {book.child_name}'s Kingdom Chronicles
        </h1>
        <p className="text-white/40 text-xs mt-1">
          A Storybook Photos Adventure · Premium Coloring Book Edition
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-2 sm:mb-3 shrink-0">
        <button
          onClick={toggleNarration}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
          style={{
            background: book.narration_url ? "#C5A26F" : "rgba(197,162,111,0.25)",
            color: book.narration_url ? "#0A1628" : "rgba(255,255,255,0.55)",
          }}
        >
          {playing ? (
            <Pause className="w-3.5 h-3.5" />
          ) : book.narration_url ? (
            <Play className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          {playing
            ? "Pause story"
            : book.narration_url
              ? "Read my story"
              : "Narration soon"}
        </button>

        {movieReady ? (
          <a
            href={videoUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: "#C5A26F", color: "#0A1628" }}
          >
            <Film className="w-3.5 h-3.5" />
            Watch movie
          </a>
        ) : movieRequested ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: "rgba(197,162,111,0.2)",
              color: "#C5A26F",
            }}
          >
            <Film className="w-3.5 h-3.5" />
            Movie in production
          </span>
        ) : (
          <button
            onClick={() => setShowMovieForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-[#C5A26F]/50 text-[#C5A26F] hover:bg-white/5"
          >
            <Film className="w-3.5 h-3.5" />
            Animate my book · $299
          </button>
        )}
      </div>

      {showMovieForm && !movieReady && !movieRequested && (
        <div
          className="w-full max-w-md mb-3 rounded-xl p-3 shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(197,162,111,0.35)",
          }}
        >
          <p className="text-white/70 text-xs mb-2 leading-relaxed">
            Disney-style keepsake: {role} {book.child_name}'s coloring-book
            pages come alive with gentle motion and a bedtime storyteller reading
            the book aloud.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg px-3 py-2 text-xs bg-black/20 text-white placeholder:text-white/30 border border-white/10"
            />
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="rounded-lg px-3 py-2 text-xs bg-black/20 text-white placeholder:text-white/30 border border-white/10"
            />
          </div>
          <button
            onClick={requestMovie}
            disabled={requesting}
            className="mt-2 w-full rounded-lg py-2 text-xs font-bold disabled:opacity-60"
            style={{ background: "#C5A26F", color: "#0A1628" }}
          >
            {requesting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending…
              </span>
            ) : (
              "Request Animated Kingdom Movie"
            )}
          </button>
        </div>
      )}

      {movieReady && videoUrl && (
        <div className="w-full max-w-2xl mb-3 shrink-0 rounded-xl overflow-hidden border border-[#C5A26F]/30">
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full max-h-[28vh] bg-black"
          />
        </div>
      )}

      <div
        className="flex items-stretch w-full max-w-4xl min-h-0"
        style={{
          height: isMobile ? "calc(100dvh - 190px)" : "calc(100dvh - 200px)",
          maxHeight: "calc(100dvh - 180px)",
        }}
      >
        <button
          onClick={() => setSpreadIndex((i) => Math.max(0, i - 1))}
          disabled={spreadIndex === 0}
          className="flex-shrink-0 w-10 flex items-center justify-center disabled:opacity-20 transition-opacity"
          style={{ color: "#C5A26F" }}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <div
          className="flex-1 flex rounded-xl overflow-hidden shadow-2xl relative"
          style={{
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(197,162,111,0.2)",
          }}
        >
          {leftPage && (
            <div
              className="flex-1 relative"
              style={{
                borderRight: isMobile ? "none" : "2px solid #C5A26F40",
              }}
            >
              <BookPage page={leftPage} pageNum={leftPageIdx + 1} />
            </div>
          )}

          {!isMobile && rightPage && (
            <div className="flex-1 relative">
              <BookPage page={rightPage} pageNum={rightPageIdx + 1} />
            </div>
          )}

          {!isMobile && rightPage && (
            <div
              className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05), rgba(0,0,0,0.15))",
                zIndex: 10,
              }}
            />
          )}
        </div>

        <button
          onClick={() =>
            setSpreadIndex((i) => Math.min(totalSpreads - 1, i + 1))
          }
          disabled={spreadIndex === totalSpreads - 1}
          className="flex-shrink-0 w-10 flex items-center justify-center disabled:opacity-20 transition-opacity"
          style={{ color: "#C5A26F" }}
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      <div className="flex gap-2 mt-2 sm:mt-3 shrink-0">
        {Array.from({ length: totalSpreads }).map((_, i) => (
          <button
            key={i}
            onClick={() => setSpreadIndex(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background:
                i === spreadIndex ? "#C5A26F" : "rgba(197,162,111,0.3)",
            }}
          />
        ))}
      </div>

      <p className="text-white/20 text-xs mt-2 shrink-0">storybookphotos.com</p>
    </div>
  );
}
