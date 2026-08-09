"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  ExternalLink,
  Film,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const ADMIN_CODE = "3121";

type BookRow = {
  id: string;
  child_name: string;
  child_age?: number;
  gender?: string;
  status?: string;
  created_at?: string;
  pages?: Array<{ imageUrl?: string | null }>;
  video_status?: string | null;
  video_url?: string | null;
  narration_url?: string | null;
  pdf_url?: string | null;
};

function roleLabel(gender?: string) {
  return gender === "boy" ? "King" : gender === "girl" ? "Queen" : "Hero";
}

function statusTone(status?: string) {
  switch (status) {
    case "ready":
    case "approved":
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "generating":
    case "in_production":
    case "requested":
    case "paid":
      return "bg-amber-100 text-amber-800";
    case "error":
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-royal-blue/5 text-royal-blue/70";
  }
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Year-1 admin home: create CTA + live books/movies/client overview.
 */
export function AdminDashboard() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/storybooks", {
        headers: { "x-admin-code": ADMIN_CODE },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
      setBooks((data.storybooks ?? data.books ?? []) as BookRow[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = books.length;
    const ready = books.filter((b) =>
      ["ready", "approved"].includes(b.status || "")
    ).length;
    const moviesQueued = books.filter((b) =>
      ["requested", "paid", "in_production"].includes(b.video_status || "")
    ).length;
    const moviesReady = books.filter(
      (b) => b.video_url || ["ready", "delivered"].includes(b.video_status || "")
    ).length;
    const withNarration = books.filter((b) => Boolean(b.narration_url)).length;
    return { total, ready, moviesQueued, moviesReady, withNarration };
  }, [books]);

  const latestBooks = books.slice(0, 8);
  const movieJobs = books
    .filter((b) => b.video_status && b.video_status !== "none")
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-enchanted-cream">
      {/* Hero */}
      <div className="bg-royal-blue border-b border-royal-gold/30">
        <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                Year 1 · Staff HQ · Code 3121
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-cream mb-3">
                Storybook Photos Command Center
              </h1>
              <p className="text-royal-cream/70 text-sm sm:text-base max-w-xl leading-relaxed">
                Create the next book, track clients, and push movies from one
                place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/admin/storybook-generator"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-royal-gold px-7 text-base font-bold text-royal-blue shadow-lg shadow-black/20 hover:bg-[#D4B480] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create & Generate Book
              </Link>
              <button
                type="button"
                onClick={load}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-royal-gold/40 bg-white/5 px-5 text-sm font-semibold text-royal-cream hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 sm:py-10 max-w-6xl space-y-8">
        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Clients / Books", value: stats.total, icon: Users },
            { label: "Books ready", value: stats.ready, icon: BookOpen },
            { label: "Movies queued", value: stats.moviesQueued, icon: Film },
            { label: "Movies ready", value: stats.moviesReady, icon: Film },
            { label: "With narration", value: stats.withNarration, icon: Sparkles },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-royal-gold/25 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-4 w-4 text-royal-gold" />
              </div>
              <p className="font-serif text-2xl font-bold text-royal-blue leading-none">
                {loading ? "—" : s.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-royal-blue/50 mt-1">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Primary CTA card */}
        <div className="rounded-2xl border-2 border-royal-gold/40 bg-gradient-to-br from-white via-[#FFFBF5] to-royal-gold/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-royal-gold text-xs font-semibold tracking-[0.18em] uppercase mb-1">
              Next session
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue mb-2">
              Start the next Kingdom book
            </h2>
            <p className="text-sm text-royal-blue/65 max-w-lg leading-relaxed">
              Face photo → adventure → watercolor pages → bedtime narration →
              optional animated movie.
            </p>
          </div>
          <Link
            href="/admin/storybook-generator"
            className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-royal-blue px-7 text-sm font-bold text-royal-gold hover:bg-royal-blue/90"
          >
            <Sparkles className="h-4 w-4" />
            Open Generator
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Latest books / clients */}
          <section className="lg:col-span-3 rounded-2xl border border-royal-gold/25 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-royal-gold/15">
              <div>
                <h3 className="font-serif text-xl font-bold text-royal-blue">
                  Latest clients & books
                </h3>
                <p className="text-xs text-royal-blue/50">Most recent first</p>
              </div>
              <Link
                href="/admin/books"
                className="text-xs font-semibold text-royal-gold hover:underline"
              >
                Full library
              </Link>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center gap-2 text-royal-blue/40">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading books…
              </div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : latestBooks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-royal-blue/60 text-sm mb-4">
                  No books yet — create your first one.
                </p>
                <Link
                  href="/admin/storybook-generator"
                  className="inline-flex items-center gap-2 rounded-lg bg-royal-gold px-4 py-2 text-sm font-bold text-royal-blue"
                >
                  <Plus className="h-4 w-4" /> Create book
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-royal-gold/10">
                {latestBooks.map((b) => {
                  const cover =
                    b.pages?.find((p) => p.imageUrl)?.imageUrl || null;
                  return (
                    <li
                      key={b.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-royal-cream/40"
                    >
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-royal-cream border border-royal-gold/20 shrink-0">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-lg">
                            👑
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-royal-blue truncate">
                          {roleLabel(b.gender)} {b.child_name}
                          {b.child_age ? (
                            <span className="text-royal-blue/45 font-normal">
                              {" "}
                              · {b.child_age}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-[11px] text-royal-blue/45">
                          {fmtDate(b.created_at)} ·{" "}
                          {b.pages?.length || 0} pages
                          {b.video_status && b.video_status !== "none"
                            ? ` · movie ${b.video_status}`
                            : ""}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusTone(b.status)}`}
                          >
                            {b.status || "unknown"}
                          </span>
                          {b.narration_url ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-royal-gold/15 text-royal-blue">
                              narration
                            </span>
                          ) : null}
                          {b.video_url ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              mp4 ready
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Link
                          href={`/admin/storybook-generator?id=${b.id}`}
                          className="text-[11px] font-semibold text-royal-blue hover:text-royal-gold"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/book/${b.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-royal-blue/60 hover:text-royal-gold"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Movies column */}
          <section className="lg:col-span-2 rounded-2xl border border-royal-gold/25 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-royal-gold/15">
              <div>
                <h3 className="font-serif text-xl font-bold text-royal-blue">
                  Movie queue
                </h3>
                <p className="text-[11px] text-royal-blue/50 leading-snug">
                  Queue = request. Watch when MP4 is pasted or use slideshow.
                </p>
              </div>
              <Link
                href="/admin/video-jobs"
                className="text-xs font-semibold text-royal-gold hover:underline"
              >
                Open
              </Link>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center text-royal-blue/40">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : movieJobs.length === 0 ? (
              <div className="p-6 text-sm text-royal-blue/55 leading-relaxed">
                <p className="mb-3">
                  No movies queued yet. On a finished book:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-xs">
                  <li>Generate Narration</li>
                  <li>Queue Animated Movie (or pick Book+Movie at create)</li>
                  <li>
                    Ops pastes final MP4 URL here → parent gets{" "}
                    <strong>Watch movie</strong>
                  </li>
                </ol>
                <p className="mt-3 text-xs">
                  Until MP4 is ready, open the book and use{" "}
                  <strong>Play story slideshow</strong> (pages + narration).
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-royal-gold/10">
                {movieJobs.map((j) => (
                  <li key={j.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-royal-blue truncate">
                          {roleLabel(j.gender)} {j.child_name}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusTone(j.video_status || undefined)}`}
                        >
                          {j.video_status}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {j.video_url ? (
                          <a
                            href={j.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-emerald-700"
                          >
                            Watch MP4
                          </a>
                        ) : (
                          <Link
                            href={`/book/${j.id}?play=1`}
                            className="text-[11px] font-bold text-royal-gold"
                          >
                            Play slideshow
                          </Link>
                        )}
                        <Link
                          href="/admin/video-jobs"
                          className="text-[11px] text-royal-blue/50 hover:text-royal-blue"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Secondary tools — compact */}
        <section>
          <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
            Tools
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                href: "/admin/storybook-generator",
                title: "Generator",
                desc: "Create watercolor books",
                icon: Sparkles,
              },
              {
                href: "/admin/books",
                title: "Books Library",
                desc: "All client books",
                icon: BookOpen,
              },
              {
                href: "/admin/video-jobs",
                title: "Movie Queue",
                desc: "Deliver MP4s",
                icon: Film,
              },
              {
                href: "/business-plan",
                title: "Business Plan",
                desc: "Plan · phases · costs · proforma",
                icon: ClipboardList,
              },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-xl border border-royal-gold/25 bg-white p-4 hover:border-royal-gold hover:shadow-md transition-all"
              >
                <t.icon className="h-4 w-4 text-royal-gold mb-2" />
                <p className="font-semibold text-royal-blue text-sm">{t.title}</p>
                <p className="text-xs text-royal-blue/50 mt-0.5">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
