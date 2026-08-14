"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, Loader2, RefreshCw, Shirt } from "lucide-react";
import { toast } from "sonner";

const ADMIN_CODE = "3121";

// Blank white tee product plate only — character art must come from THIS book.
const BLANK_WHITE_TEE = "/merch/approved-white-tee.jpg";
const BLANK_WHITE_TEE_ALT = "/brand/merch-tee-white-notext-approved.jpg";

type BookRow = {
  id: string;
  child_name?: string;
  gender?: string;
  notes?: string | null;
  pages?: Array<{ imageUrl?: string | null; title?: string | null }>;
};

function readNoteTag(notes: string | null | undefined, tag: string): string | null {
  if (!notes) return null;
  const m = notes.match(new RegExp(`\\[${tag}:\\s*([^\\]]+)\\]`));
  return m?.[1]?.trim() || null;
}

function pickHeroFromPages(pages?: BookRow["pages"]): string | null {
  if (!pages?.length) return null;
  const http = pages
    .map((p, index) => ({
      url: p.imageUrl || "",
      title: (p.title || "").toLowerCase(),
      index,
    }))
    .filter((p) => p.url.startsWith("http"));
  if (!http.length) return null;
  http.sort((a, b) => {
    const score = (x: typeof a) =>
      (/title|cover|call/.test(x.title) ? 10 : 0) - x.index * 0.1;
    return score(b) - score(a);
  });
  return http[0].url;
}

export function ShirtReview({ bookId }: { bookId: string }) {
  const [book, setBook] = useState<BookRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
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
      if (!found) {
        setError("Book not found");
        setBook(null);
        return;
      }
      setBook(found);
      const notes = found.notes || "";
      setMockupUrl(readNoteTag(notes, "ShirtMockup"));
      setCutoutUrl(readNoteTag(notes, "ShirtCutout"));
      setSourceUrl(readNoteTag(notes, "ShirtSource") || pickHeroFromPages(found.pages));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load book");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    try {
      if (localStorage.getItem(`sbp-shirt-approved-${bookId}`)) setApproved(true);
    } catch {
      /* ignore */
    }
  }, [bookId]);

  const child = book?.child_name || "Hero";
  const role =
    book?.gender === "boy" ? "King" : book?.gender === "girl" ? "Queen" : "Hero";

  const displayUrl = useMemo(() => {
    // Prefer true per-book mockup; never fall back to shared Raelyn character tee as "done"
    if (mockupUrl) return mockupUrl;
    if (cutoutUrl) return cutoutUrl;
    return null;
  }, [mockupUrl, cutoutUrl]);

  async function generateShirt(force = false) {
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/storybooks/${bookId}/shirt`, {
        method: "POST",
        headers: {
          "x-admin-code": ADMIN_CODE,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Shirt generate failed (${res.status})`);
      setMockupUrl(data.shirt_mockup_url || null);
      setCutoutUrl(data.shirt_cutout_url || null);
      setSourceUrl(data.shirt_source_url || null);
      toast.success(data.reused ? "Loaded existing shirt mockup" : "Shirt mockup ready");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Shirt generate failed");
    } finally {
      setGenerating(false);
    }
  }

  // Auto-generate once if this book has pages but no mockup yet
  useEffect(() => {
    if (loading || !book || generating || mockupUrl) return;
    const hasArt = (book.pages || []).some(
      (p) => typeof p.imageUrl === "string" && p.imageUrl.startsWith("http")
    );
    if (!hasArt) return;
    void generateShirt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, book?.id, mockupUrl]);

  function markApproved() {
    if (!displayUrl) {
      toast.error("Generate the shirt first");
      return;
    }
    setApproved(true);
    try {
      localStorage.setItem(`sbp-shirt-approved-${bookId}`, displayUrl);
    } catch {
      /* ignore */
    }
    toast.success("Shirt approved for Printful");
  }

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
              Merch review · Per-book white tee
            </p>
            <h1
              className="text-3xl font-bold text-royal-blue"
              style={{ color: "#0A1628" }}
            >
              {loading ? "Loading…" : `${child}'s Shirt`}
            </h1>
            <p className="text-gray-500 mt-1">
              {role} {child} · cutout from <strong>this book's</strong> hero art on a
              white tee
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
          <div className="rounded-2xl bg-white border border-red-100 p-6 text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-800">
                  {mockupUrl
                    ? "Per-book shirt mockup"
                    : generating
                      ? "Building shirt from this book…"
                      : "Shirt mockup"}
                </p>
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
              <div className="p-4 sm:p-6 flex justify-center bg-[#F3EEE4] min-h-[320px]">
                {displayUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayUrl}
                    alt={`${child} white tee mockup from this storybook`}
                    className="max-h-[70vh] w-auto rounded-xl shadow-md"
                  />
                ) : generating ? (
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-500 py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                    <p className="text-sm font-medium">
                      Cutting out {child} and placing on white tee…
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      No per-book shirt yet. Blank white tee plate only (not Raelyn art).
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={BLANK_WHITE_TEE}
                      alt="Blank white tee plate"
                      className="max-h-[40vh] w-auto mx-auto rounded-xl opacity-80"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = BLANK_WHITE_TEE_ALT;
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {(sourceUrl || cutoutUrl) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {sourceUrl ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Source page art
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sourceUrl} alt="Source hero" className="w-full rounded-lg" />
                  </div>
                ) : null}
                {cutoutUrl ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Character cutout
                    </p>
                    <div className="rounded-lg bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22><rect width=%228%22 height=%228%22 fill=%22%23eee%22/><rect x=%228%22 y=%228%22 width=%228%22 height=%228%22 fill=%22%23eee%22/><rect x=%228%22 width=%228%22 height=%228%22 fill=%22%23ddd%22/><rect y=%228%22 width=%228%22 height=%228%22 fill=%22%23ddd%22/></svg>')] p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cutoutUrl}
                        alt="Cutout"
                        className="w-full rounded-lg max-h-64 object-contain mx-auto"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Printful settings</h2>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>
                  <strong>Color:</strong> White
                </li>
                <li>
                  <strong>Product:</strong> Kids / Youth classic tee
                </li>
                <li>
                  <strong>Placement:</strong> Front center chest
                </li>
                <li>
                  <strong>Design:</strong> Cutout of {child} from this book (not a shared
                  default)
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void generateShirt(true)}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {mockupUrl ? "Regenerate from book" : "Generate from book"}
                </button>
                <button
                  type="button"
                  onClick={markApproved}
                  disabled={!displayUrl}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #B98A19, #d4a843)" }}
                >
                  <Check className="w-4 h-4" />
                  {approved ? "Approved ✓" : "Approve shirt"}
                </button>
                {displayUrl ? (
                  <a
                    href={displayUrl}
                    download={`${child.replace(/\s+/g, "-")}-white-tee.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download mockup
                  </a>
                ) : null}
                {cutoutUrl ? (
                  <a
                    href={cutoutUrl}
                    download={`${child.replace(/\s+/g, "-")}-cutout.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download cutout PNG
                  </a>
                ) : null}
                <Link
                  href={`/book/${bookId}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Open book
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-400">Book ID: {bookId}</p>
          </div>
        )}
      </div>
    </div>
  );
}
