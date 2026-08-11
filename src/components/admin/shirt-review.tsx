"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, Loader2, Shirt } from "lucide-react";
import { toast } from "sonner";

const ADMIN_CODE = "3121";

// Justin-approved white tee (no-text baseline) — locked 2026-08-11
const APPROVED_WHITE_TEE = "/merch/approved-white-tee.jpg";
const APPROVED_WHITE_TEE_ALT = "/brand/merch-tee-white-notext-approved.jpg";

type BookRow = {
  id: string;
  child_name?: string;
  gender?: string;
  pages?: Array<{ imageUrl?: string | null }>;
};

export function ShirtReview({ bookId }: { bookId: string }) {
  const [book, setBook] = useState<BookRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/storybooks", {
          headers: { "x-admin-code": ADMIN_CODE },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
        const list = (data.storybooks ?? []) as BookRow[];
        const found = list.find((b) => b.id === bookId) || null;
        if (!cancelled) {
          if (!found) setError("Book not found");
          setBook(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load book");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const child = book?.child_name || "Hero";
  const role = book?.gender === "boy" ? "King" : book?.gender === "girl" ? "Queen" : "Hero";

  function markApproved() {
    setApproved(true);
    try {
      localStorage.setItem(`sbp-shirt-approved-${bookId}`, "white-approved-baseline");
    } catch {
      /* ignore */
    }
    toast.success("White tee approved for Printful");
  }

  useEffect(() => {
    try {
      if (localStorage.getItem(`sbp-shirt-approved-${bookId}`)) setApproved(true);
    } catch {
      /* ignore */
    }
  }, [bookId]);

  return (
    <div className="min-h-screen bg-cream-50 p-6" style={{ background: "#F8F4EC" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/books"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Books Library
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 mb-1">
              Merch review · White tee
            </p>
            <h1 className="text-3xl font-bold text-royal-blue" style={{ color: "#0A1628" }}>
              {loading ? "Loading…" : `${child}'s Shirt`}
            </h1>
            <p className="text-gray-500 mt-1">
              {role} {child} · Justin-approved white tee (no-text baseline)
            </p>
          </div>
          <div className="rounded-full bg-white border border-amber-200 p-3 shadow-sm">
            <Shirt className="w-6 h-6 text-amber-700" />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading book…
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white border border-red-100 p-6 text-red-600">{error}</div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">White tee mockup</p>
                {approved ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Approved
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                    Needs review
                  </span>
                )}
              </div>
              <div className="p-4 sm:p-6 flex justify-center bg-[#F3EEE4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={APPROVED_WHITE_TEE}
                  alt={`${child} white tee mockup`}
                  className="max-h-[70vh] w-auto rounded-xl shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = APPROVED_WHITE_TEE_ALT;
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Printful settings</h2>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>
                  <strong>Color:</strong> White
                </li>
                <li>
                  <strong>Product:</strong> Kids / Youth classic tee (parent match optional)
                </li>
                <li>
                  <strong>Placement:</strong> Front center chest
                </li>
                <li>
                  <strong>Design:</strong> Yesterday's approved no-text baseline
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={markApproved}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold"
                  style={{ background: "linear-gradient(135deg, #B98A19, #d4a843)" }}
                >
                  <Check className="w-4 h-4" />
                  {approved ? "Approved ✓" : "Approve white tee"}
                </button>
                <a
                  href={APPROVED_WHITE_TEE}
                  download={`${child.replace(/\s+/g, "-")}-white-tee.jpg`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Download mockup
                </a>
                <Link
                  href={`/book/${bookId}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Open book
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Book ID: {bookId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
