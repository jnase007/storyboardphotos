"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  notes?: string | null;
  book_title?: string | null;
  adventure_path?: string | null;
  narration_url?: string | null;
  video_status?: string | null;
  video_url?: string | null;
  video_package?: string | null;
};

const QUEST_LABELS: Record<string, string> = {
  "dragon-slayer": "Dragon Mountain",
  "rescue-mission": "Broken Bridge Rescue",
  "lost-crown": "Crown of the Cliffs",
  "forest-guardian": "Storm in the Living Forest",
  "kindness-quest": "Midnight Lantern Run",
  "light-treasure": "Treasure Gauntlet",
};

function resolveBookDisplayTitle(book: Book, role: string): string {
  const notes = book.notes || "";
  const tagged = notes.match(/\[BookTitle:\s*([^\]]+)\]/i)?.[1]?.trim();
  if (tagged && /\band\b/i.test(tagged)) return tagged.replace(/\s+/g, " ").trim();

  const stored = (book.book_title || "").replace(/\s+/g, " ").trim();
  if (stored && /\band\b/i.test(stored)) return stored;

  // Infer quest from first page text/title when book_title missing
  const first = book.pages?.[0];
  const blob = `${first?.title || ""}\n${first?.text || ""}`;
  const m = blob.match(
    /(?:King|Queen)\s+[\w'’.-]+(?:\s+[\w'’.-]+){0,2}\s+and\s+(?:the\s+)?[^\n.]+/i
  );
  if (m) return m[0].replace(/\s+/g, " ").trim();

  const adv =
    book.adventure_path ||
    notes.match(/\[Adventure:\s*([^\]]+)\]/i)?.[1]?.trim() ||
    "";
  const quest =
    (adv && QUEST_LABELS[adv]) ||
    (first?.title && !/^title page$/i.test(first.title) ? first.title : null);
  if (quest) {
    const q = quest.replace(/^the\s+/i, "").trim();
    return `${role} ${book.child_name} and the ${q}`;
  }
  return `${role} ${book.child_name}'s Kingdom Chronicles`;
}

function BookPage({
  page,
  pageNum,
  fullBleed = false,
}: {
  page: StoryPage;
  pageNum: number;
  fullBleed?: boolean;
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

  if (fullBleed) {
    return (
      <div className="relative h-full w-full" style={{ background: "#0A1628" }}>
        {page.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.imageUrl}
            alt={page.title || ""}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            👑
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 p-4 sm:p-6 pt-16"
          style={{
            background:
              "linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.55) 55%, transparent 100%)",
          }}
        >
          {showTitle ? (
            <h3
              className="font-bold text-sm sm:text-base mb-1"
              style={{ color: "#C5A26F", fontFamily: "Georgia, serif" }}
            >
              {page.title}
            </h3>
          ) : null}
          <p
            className="text-xs sm:text-sm leading-relaxed text-white/90 max-h-[28vh] overflow-hidden"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {page.text}
          </p>
          <p className="text-[10px] mt-2 italic" style={{ color: "#C5A26F" }}>
            {pageNum}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#F8F4EC" }}>
      <div className="flex-shrink-0" style={{ height: "60%" }}>
        {page.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.imageUrl}
            alt={page.title}
            className="w-full h-full object-cover bg-[#F8F1E3]"
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

      <div className="flex-1 overflow-hidden px-4 py-3 sm:px-5 sm:py-4 flex flex-col justify-center">
        {showTitle && (
          <h3
            className="font-bold text-base sm:text-lg mb-2 text-center"
            style={{ color: "#B98A19", fontFamily: "Georgia, serif" }}
          >
            {page.title}
          </h3>
        )}
        <p
          className="text-[15px] sm:text-lg leading-snug sm:leading-relaxed text-center flex-1 overflow-hidden whitespace-pre-line"
          style={{ color: "#0A1628", fontFamily: "Georgia, serif" }}
        >
          {page.text}
        </p>
        <div className="text-center mt-2 shrink-0">
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
  const [pageIndex, setPageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [slideshow, setSlideshow] = useState(false);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [videoStatus, setVideoStatus] = useState(book.video_status ?? "none");
  const [videoUrl, setVideoUrl] = useState(book.video_url ?? null);
  const [requesting, setRequesting] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [showMoviePlayer, setShowMoviePlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const totalPages = book.pages.length;
  const role = book.gender === "boy" ? "King" : "Queen";
  const displayTitle = resolveBookDisplayTitle(book, role);

  const autoPlayRequested = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("play") === "1";
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setPlayingAudio(false);
      setSlideshow(false);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [book.narration_url]);

  // Auto-start slideshow from ?play=1 (admin movie queue shortcut)
  useEffect(() => {
    if (!autoPlayRequested) return;
    void startSlideshow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayRequested]);

  // Advance pages while slideshow + narration play
  useEffect(() => {
    if (!slideshow || totalPages <= 1) return;
    const secondsPerPage = Math.max(
      4,
      Math.min(10, (audioRef.current?.duration || totalPages * 6) / totalPages)
    );
    const id = window.setInterval(() => {
      setPageIndex((i) => {
        if (i >= totalPages - 1) return i;
        return i + 1;
      });
      setSpreadIndex((i) => {
        const pps = isMobile ? 1 : 2;
        const max = Math.max(0, Math.ceil(totalPages / pps) - 1);
        const nextPage = Math.min(totalPages - 1, pageIndex + 1);
        return Math.min(max, Math.floor(nextPage / pps));
      });
    }, secondsPerPage * 1000);
    return () => window.clearInterval(id);
  }, [slideshow, totalPages, isMobile, pageIndex]);

  const pagesPerSpread = isMobile ? 1 : 2;
  const totalSpreads = Math.ceil(totalPages / pagesPerSpread) || 1;
  const leftPageIdx = spreadIndex * pagesPerSpread;
  const rightPageIdx = leftPageIdx + 1;
  const leftPage = book.pages[leftPageIdx];
  const rightPage = book.pages[rightPageIdx];
  const currentPage = book.pages[pageIndex] ?? book.pages[0];

  function pauseMovie() {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setShowMoviePlayer(false);
  }

  async function startSlideshow() {
    // Exclusive: slideshow OR movie — never both
    pauseMovie();
    setPageIndex(0);
    setSpreadIndex(0);
    setSlideshow(true);
    if (!book.narration_url) {
      toast.message("Playing page slideshow — add narration for full read-aloud");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      await audio.play();
      setPlayingAudio(true);
    } catch {
      toast.error("Could not start audio — tap Play again");
    }
  }

  function stopSlideshow() {
    setSlideshow(false);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlayingAudio(false);
  }

  function openMoviePlayer() {
    // Exclusive: stop slideshow/narration before movie sound
    stopSlideshow();
    setShowMoviePlayer(true);
  }

  async function toggleNarration() {
    if (slideshow) {
      stopSlideshow();
      return;
    }
    if (!book.narration_url) {
      // Still allow silent page flip slideshow
      await startSlideshow();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (playingAudio) {
      audio.pause();
      setPlayingAudio(false);
      return;
    }
    try {
      await audio.play();
      setPlayingAudio(true);
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
      toast.success("Movie requested! Production will deliver an MP4.");
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
        <audio ref={audioRef} src={book.narration_url} preload="metadata" />
      ) : null}

      <div className="text-center mb-2 sm:mb-3 shrink-0">
        <h1
          className="text-lg sm:text-xl font-bold"
          style={{ color: "#C5A26F", fontFamily: "Georgia, serif" }}
        >
          {displayTitle}
        </h1>
        <p className="text-white/40 text-xs mt-1">
          A Storybook Photos Adventure
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-2 sm:mb-3 shrink-0">
        <button
          onClick={() => void toggleNarration()}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
          style={{
            background:
              book.narration_url || slideshow
                ? "#C5A26F"
                : "rgba(197,162,111,0.25)",
            color:
              book.narration_url || slideshow
                ? "#0A1628"
                : "rgba(255,255,255,0.55)",
          }}
        >
          {playingAudio || slideshow ? (
            <Pause className="w-3.5 h-3.5" />
          ) : book.narration_url ? (
            <Play className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          {playingAudio || slideshow
            ? "Pause"
            : book.narration_url
              ? "Read my story"
              : "Flip pages"}
        </button>

        <button
          onClick={() => {
            if (slideshow) stopSlideshow();
            else void startSlideshow();
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-[#C5A26F]/50 text-[#C5A26F] hover:bg-white/5"
        >
          <Play className="w-3.5 h-3.5" />
          {slideshow ? "Stop slideshow" : "Play story slideshow"}
        </button>

        {movieReady ? (
          <>
            <button
              type="button"
              onClick={() => {
                if (showMoviePlayer) {
                  pauseMovie();
                } else {
                  openMoviePlayer();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ background: "#C5A26F", color: "#0A1628" }}
            >
              <Film className="w-3.5 h-3.5" />
              {showMoviePlayer ? "Hide movie" : "Watch movie"}
            </button>
            <a
              href={videoUrl!}
              download={`${book.child_name.replace(/\s+/g, "-")}-Kingdom-Movie.mp4`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-[#C5A26F]/50 text-[#C5A26F] hover:bg-white/5"
            >
              Download MP4
            </a>
          </>
        ) : movieRequested ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: "rgba(197,162,111,0.2)",
              color: "#C5A26F",
            }}
            title="Premium MP4 rendering — use Play story slideshow while you wait"
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
            Animated movie · from $2,000
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
            Heirloom animated movie ($2,000–$3,000): each page comes alive with
            cinematic motion + bedtime narration — real downloadable MP4, not a
            slideshow. While we produce it, use{" "}
            <strong>Play story slideshow</strong> above.
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

      {/* Movie player only when user asks — never under an active slideshow */}
      {movieReady && videoUrl && showMoviePlayer && !slideshow && (
        <div className="w-full max-w-2xl mb-3 shrink-0 rounded-xl overflow-hidden border border-[#C5A26F]/30">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            autoPlay
            className="w-full max-h-[40vh] bg-black"
            onPlay={() => {
              // If user hits play on movie, kill slideshow audio
              stopSlideshow();
            }}
          />
        </div>
      )}

      {/* Slideshow cinema mode */}
      {slideshow && currentPage ? (
        <div
          className="w-full max-w-4xl min-h-0 rounded-xl overflow-hidden shadow-2xl relative"
          style={{
            height: isMobile ? "calc(100dvh - 170px)" : "calc(100dvh - 180px)",
            maxHeight: "calc(100dvh - 160px)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          }}
        >
          <BookPage page={currentPage} pageNum={pageIndex + 1} fullBleed />
          <div className="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1 text-[10px] text-white/80">
            {pageIndex + 1} / {totalPages}
            {playingAudio ? " · reading aloud" : ""}
          </div>
        </div>
      ) : (
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
      )}

      {!slideshow && (
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
      )}

      <p className="text-white/20 text-xs mt-2 shrink-0">storybookphotos.com</p>
    </div>
  );
}
