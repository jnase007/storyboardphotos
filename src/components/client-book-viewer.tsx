"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
};

function BookPage({ page, pageNum, total }: { page: StoryPage; pageNum: number; total: number }) {
  const skipTitles = ["Title Page", "The Dragon Quest", "The Rescue Mission", "The Lost Crown", "The Forest Guardian", "The Kindness Quest", "The Light Treasure", "The Kingdom of Light"];
  const showTitle = page.title && !skipTitles.includes(page.title);

  return (
    <div className="flex flex-col h-full" style={{ background: "#F8F4EC" }}>
      {/* Image — top 60% */}
      <div className="flex-shrink-0" style={{ height: "60%" }}>
        {page.imageUrl ? (
          <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#0A1628" }}>
            <span className="text-5xl">👑</span>
          </div>
        )}
      </div>

      {/* Gold divider */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #C5A26F, transparent)" }} />

      {/* Text — bottom 40% */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col">
        {showTitle && (
          <h3 className="font-bold text-sm mb-2" style={{ color: "#B98A19", fontFamily: "Georgia, serif" }}>
            {page.title}
          </h3>
        )}
        <p className="text-xs leading-relaxed flex-1 overflow-hidden" style={{ color: "#0A1628", fontFamily: "Georgia, serif" }}>
          {page.text}
        </p>
        {/* Page number */}
        <div className="text-center mt-2">
          <span className="text-xs italic" style={{ color: "#B98A19" }}>{pageNum}</span>
        </div>
      </div>
    </div>
  );
}

export function ClientBookViewer({ book }: { book: Book }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const totalPages = book.pages.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mobile: single page. Desktop: two-page spread
  const pagesPerSpread = isMobile ? 1 : 2;
  const totalSpreads = Math.ceil(totalPages / pagesPerSpread);
  const leftPageIdx = spreadIndex * pagesPerSpread;
  const rightPageIdx = leftPageIdx + 1;
  const leftPage = book.pages[leftPageIdx];
  const rightPage = book.pages[rightPageIdx];

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0A1628 0%, #2D1B4E 100%)", height: "100dvh", paddingTop: "76px", padding: "12px" }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold" style={{ color: "#C5A26F", fontFamily: "Georgia, serif" }}>
          {book.child_name}&apos;s Kingdom Quest
        </h1>
        <p className="text-white/40 text-xs mt-1">A Storybook Photos Adventure</p>
      </div>

      {/* Book spread */}
      <div className="flex items-stretch w-full max-w-4xl" style={{ height: isMobile ? "calc(100dvh - 160px)" : "calc(100dvh - 170px)" }}>
        {/* Left arrow */}
        <button
          onClick={() => setSpreadIndex((i) => Math.max(0, i - 1))}
          disabled={spreadIndex === 0}
          className="flex-shrink-0 w-10 flex items-center justify-center disabled:opacity-20 transition-opacity"
          style={{ color: "#C5A26F" }}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        {/* Book pages */}
        <div
          className="flex-1 flex rounded-xl overflow-hidden shadow-2xl"
          style={{
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(197,162,111,0.2)",
          }}
        >
          {/* Left page */}
          {leftPage && (
            <div className="flex-1 relative" style={{ borderRight: isMobile ? "none" : "2px solid #C5A26F40" }}>
              <BookPage page={leftPage} pageNum={leftPageIdx + 1} total={totalPages} />
            </div>
          )}

          {/* Right page — desktop only */}
          {!isMobile && rightPage && (
            <div className="flex-1 relative">
              <BookPage page={rightPage} pageNum={rightPageIdx + 1} total={totalPages} />
            </div>
          )}

          {/* Spine shadow */}
          {!isMobile && rightPage && (
            <div
              className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 pointer-events-none"
              style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05), rgba(0,0,0,0.15))", zIndex: 10 }}
            />
          )}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => setSpreadIndex((i) => Math.min(totalSpreads - 1, i + 1))}
          disabled={spreadIndex === totalSpreads - 1}
          className="flex-shrink-0 w-10 flex items-center justify-center disabled:opacity-20 transition-opacity"
          style={{ color: "#C5A26F" }}
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalSpreads }).map((_, i) => (
          <button
            key={i}
            onClick={() => setSpreadIndex(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{ background: i === spreadIndex ? "#C5A26F" : "rgba(197,162,111,0.3)" }}
          />
        ))}
      </div>

      <p className="text-white/20 text-xs mt-4">storybookphotos.com</p>
    </div>
  );
}
