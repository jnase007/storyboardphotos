"use client";

import { useState } from "react";
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

export function ClientBookViewer({ book }: { book: Book }) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = book.pages[pageIndex];
  const totalPages = book.pages.length;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0A1628 0%, #2D1B4E 100%)" }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#C5A26F" }}>
          {book.child_name}'s Kingdom Quest
        </h1>
        <p className="text-white/50 text-sm mt-1">A Storybook Photos Adventure</p>
      </div>

      {/* Book */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#F8F4EC" }}
      >
        {/* Image */}
        {page.imageUrl ? (
          <div className="aspect-[3/4] w-full overflow-hidden">
            <img
              src={page.imageUrl}
              alt={page.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="aspect-[3/4] w-full flex items-center justify-center"
            style={{ background: "#0A1628" }}
          >
            <span className="text-6xl">👑</span>
          </div>
        )}

        {/* Text */}
        <div className="p-5">
          {page.title && page.title !== "Title Page" && (
            <h2 className="font-bold text-lg mb-2" style={{ color: "#B98A19" }}>
              {page.title}
            </h2>
          )}
          <p className="text-sm leading-relaxed" style={{ color: "#0A1628" }}>
            {page.text}
          </p>
        </div>

        {/* Page indicator */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Page {pageIndex + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            {book.pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setPageIndex(i)}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{ background: i === pageIndex ? "#B98A19" : "#d1d5db" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
          className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
          style={{ background: "rgba(197,162,111,0.2)", color: "#C5A26F" }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
          disabled={pageIndex === totalPages - 1}
          className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
          style={{ background: "rgba(197,162,111,0.2)", color: "#C5A26F" }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Footer */}
      <p className="text-white/30 text-xs mt-8">
        Storybook Photos | Kingdom Quests · storybookphotos.com
      </p>
    </div>
  );
}
