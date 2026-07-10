"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import {
  SAMPLE_STORYBOOKS,
  type StoryPage,
} from "@/lib/sample-storybooks";
import { cn } from "@/lib/utils";

const SET_IMAGES: Record<string, string> = {
  "Throne Room": "/sets/throne-room.jpg",
  "Royal Forest": "/sets/royal-forest.webp",
  "Royal Garden": "/sets/royal-garden.webp",
  "Chastle": "/sets/chastle.webp",
};

/**
 * Interactive sample storybook for the business plan —
 * princess / prince tabs + page-by-page viewer.
 */
export function StorybookPreview() {
  const [versionId, setVersionId] = useState<"princess" | "prince">("princess");
  const [pageIndex, setPageIndex] = useState(0);

  const version =
    SAMPLE_STORYBOOKS.find((v) => v.id === versionId) ?? SAMPLE_STORYBOOKS[0];
  const page = version.pages[pageIndex];

  function selectVersion(id: "princess" | "prince") {
    setVersionId(id);
    setPageIndex(0);
  }

  function goPrev() {
    setPageIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setPageIndex((i) => Math.min(version.pages.length - 1, i + 1));
  }

  return (
    <section className="rounded-2xl border-2 border-royal-gold/40 bg-white overflow-hidden shadow-lg shadow-royal-gold/10 print:break-inside-avoid">
      {/* Header */}
      <div className="bg-royal-blue px-5 sm:px-8 py-6 border-b border-royal-gold/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 min-w-0">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-royal-gold/20 ring-1 ring-royal-gold/35">
            <BookOpen className="h-5 w-5 text-royal-gold" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-cream break-words min-w-0">
            See What Your Child&apos;s Storybook Looks Like
          </h2>
        </div>
        <p className="text-royal-cream/65 text-sm sm:text-base leading-relaxed sm:ml-[3.25rem]">
          Flip through the full Princess and Prince Kingdom Quest sample books.
        </p>
      </div>

      <div className="p-5 sm:p-8">
        {/* Version tabs */}
        <div
          role="tablist"
          aria-label="Storybook version"
          className="flex flex-col sm:flex-row gap-2 mb-6"
        >
          {SAMPLE_STORYBOOKS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={versionId === v.id}
              onClick={() => selectVersion(v.id)}
              className={cn(
                "flex-1 rounded-xl border-2 px-4 py-3.5 text-left transition-all",
                versionId === v.id
                  ? "bg-royal-blue border-royal-gold text-royal-cream shadow-md shadow-royal-gold/20"
                  : "bg-royal-cream/50 border-royal-gold/25 text-royal-blue hover:border-royal-gold/50"
              )}
            >
              <span
                className={cn(
                  "block text-[10px] font-semibold tracking-[0.2em] uppercase mb-1",
                  versionId === v.id ? "text-royal-gold" : "text-royal-gold/80"
                )}
              >
                {v.shortLabel} Version
              </span>
              <span className="font-serif text-base sm:text-lg font-bold leading-snug">
                {v.tabLabel}
              </span>
            </button>
          ))}
        </div>

        {/* Book title for active version */}
        <p className="font-serif text-center text-lg sm:text-xl font-bold text-royal-blue mb-5">
          {version.bookTitle}
        </p>

        {/* Open storybook frame */}
        <div className="relative rounded-2xl border border-royal-gold/30 bg-gradient-to-br from-[#FFFBF5] via-white to-[#F5EDE0] p-4 sm:p-6 shadow-inner">
          <div
            className="pointer-events-none absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-royal-gold/25 to-transparent hidden sm:block"
            aria-hidden="true"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${version.id}-${page.page}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid sm:grid-cols-2 gap-6 sm:gap-8 min-h-[320px]"
            >
              {/* Left: story text */}
              <div className="flex flex-col justify-center px-1 sm:pr-4">
                <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                  Page {page.page} of {version.pages.length}
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue mb-4 leading-tight">
                  {page.title}
                </h3>
                <p className="text-royal-blue/75 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {page.text}
                </p>
              </div>

              {/* Right: photo placeholder */}
              <StoryPageVisual page={page} />
            </motion.div>
          </AnimatePresence>

          {/* Page controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-royal-gold/20 pt-5">
            <button
              type="button"
              onClick={goPrev}
              disabled={pageIndex === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-royal-gold/35 bg-white px-4 text-sm font-semibold text-royal-blue disabled:opacity-40 hover:bg-royal-gold/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex flex-wrap justify-center gap-1.5">
              {version.pages.map((p, i) => (
                <button
                  key={p.page}
                  type="button"
                  onClick={() => setPageIndex(i)}
                  aria-label={`Go to page ${p.page}`}
                  aria-current={i === pageIndex ? "page" : undefined}
                  className={cn(
                    "h-10 min-w-10 sm:h-8 sm:min-w-8 rounded-md px-2 text-xs font-bold transition-colors",
                    i === pageIndex
                      ? "bg-royal-gold text-royal-blue"
                      : "bg-royal-blue/5 text-royal-blue/60 hover:bg-royal-gold/20"
                  )}
                >
                  {p.page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={pageIndex === version.pages.length - 1}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-royal-gold/35 bg-white px-4 text-sm font-semibold text-royal-blue disabled:opacity-40 hover:bg-royal-gold/10 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-royal-blue/55 leading-relaxed max-w-2xl mx-auto">
          Photos from your session will be placed in these spots. AI-generated
          illustrations fill the rest.
        </p>
      </div>
    </section>
  );
}

function StoryPageVisual({ page }: { page: StoryPage }) {
  const setSrc = page.photoSet ? SET_IMAGES[page.photoSet] : undefined;

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-royal-gold/30 bg-royal-cream shadow-md aspect-[4/5] sm:aspect-auto sm:min-h-[280px]">
      {setSrc ? (
        <Image
          src={setSrc}
          alt={page.photoCaption}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 320px"
        />
      ) : (
        /* Portrait / session photo placeholder (pages without a set image) */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-royal-cream via-[#F5EDE0] to-royal-gold/20 px-6 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-royal-gold/20 ring-1 ring-royal-gold/35">
            <Camera className="h-7 w-7 text-royal-gold" />
          </div>
          <p className="font-serif text-base font-bold text-royal-blue mb-1">
            Session Photo
          </p>
          <p className="text-xs text-royal-blue/50 max-w-[200px] leading-relaxed">
            Your child&apos;s photo appears here
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/75 via-transparent to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-4">
        <p className="inline-flex items-start gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-royal-blue shadow-sm leading-snug">
          <Camera className="h-3.5 w-3.5 text-royal-gold shrink-0 mt-0.5" />
          {page.photoCaption}
        </p>
      </div>
    </div>
  );
}
