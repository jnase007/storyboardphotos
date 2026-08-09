"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  Film,
  Loader2,
  Mic,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  MOVIE_TRACKER_STEPS,
  parseMovieTracker,
  type MovieTrackerState,
} from "@/lib/storybook/movie-tracker";

const ADMIN_CODE = "3121";

type Job = {
  id: string;
  child_name: string;
  child_age: number;
  gender: string;
  video_status: string;
  video_url?: string | null;
  video_package?: string | null;
  video_requested_at?: string | null;
  video_contact_name?: string | null;
  video_contact_email?: string | null;
  video_notes?: string | null;
  narration_url?: string | null;
  narration_script?: string | null;
  page_count: number;
  page_images: string[];
  preview_image?: string | null;
};

function DominoTracker({ tracker }: { tracker: MovieTrackerState }) {
  const failed = tracker.step === "failed";
  const activeIdx = MOVIE_TRACKER_STEPS.findIndex((s) => s.id === tracker.step);
  const idx = failed ? -1 : activeIdx < 0 ? 0 : activeIdx;

  return (
    <div
      className="mt-4 rounded-2xl border p-4"
      style={{
        borderColor: failed ? "#fecaca" : "#f5e6c8",
        background: failed
          ? "linear-gradient(135deg,#fff5f5,#fff)"
          : "linear-gradient(135deg,#fffaf0,#ffffff)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">
            🍕 Pizza Tracker · {failed ? "Kitchen issue" : tracker.label}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {tracker.detail ||
              (failed
                ? tracker.error || "Render failed"
                : "Your kingdom movie is cooking…")}
            {typeof tracker.clipsDone === "number" &&
            typeof tracker.clipsTotal === "number" &&
            tracker.clipsTotal > 0
              ? ` · page ${tracker.clipsDone}/${tracker.clipsTotal}`
              : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="text-2xl font-black tabular-nums"
            style={{ color: failed ? "#b91c1c" : "#B98A19" }}
          >
            {failed ? "—" : `${tracker.pct}%`}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            complete
          </p>
        </div>
      </div>

      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${failed ? 100 : Math.max(4, tracker.pct)}%`,
            background: failed
              ? "linear-gradient(90deg,#ef4444,#f97316)"
              : "linear-gradient(90deg,#B98A19,#e8c56a,#B98A19)",
          }}
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {MOVIE_TRACKER_STEPS.map((s, i) => {
          const done = !failed && (tracker.step === "done" || i < idx);
          const current = !failed && i === idx;
          return (
            <div key={s.id} className="text-center">
              <div
                className="mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 mb-1"
                style={{
                  borderColor: done || current ? "#B98A19" : "#e5e7eb",
                  background: done
                    ? "#B98A19"
                    : current
                      ? "#fff7e6"
                      : "#fff",
                  color: done ? "#fff" : current ? "#B98A19" : "#9ca3af",
                  boxShadow: current ? "0 0 0 4px rgba(185,138,25,0.15)" : undefined,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <p
                className="text-[10px] font-semibold leading-tight"
                style={{ color: done || current ? "#0A1628" : "#9ca3af" }}
              >
                {s.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUSES = [
  "requested",
  "paid",
  "in_production",
  "ready",
  "delivered",
  "cancelled",
] as const;

export function VideoJobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [narratingId, setNarratingId] = useState<string | null>(null);
  const [renderingId, setRenderingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { status: string; url: string; notes: string }>
  >({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/video-jobs", {
        headers: { "x-admin-code": ADMIN_CODE },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      const list = (data.jobs ?? []) as Job[];
      setJobs(list);
      const next: typeof drafts = {};
      for (const j of list) {
        next[j.id] = {
          status: j.video_status || "requested",
          url: j.video_url || "",
          notes: j.video_notes || "",
        };
      }
      setDrafts(next);
      if (data.hint) toast.message(data.hint);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Domino's-style auto refresh while anything is in the oven
  const cooking = useMemo(
    () => jobs.some((j) => j.video_status === "in_production"),
    [jobs]
  );
  useEffect(() => {
    if (!cooking) return;
    const t = setInterval(() => {
      void load();
    }, 8000);
    return () => clearInterval(t);
  }, [cooking]);

  async function saveJob(id: string) {
    const d = drafts[id];
    if (!d) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/storybooks/${id}/video`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": ADMIN_CODE,
        },
        body: JSON.stringify({
          video_status: d.status,
          video_url: d.url || null,
          video_notes: d.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("Saved");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  async function generateNarration(id: string) {
    setNarratingId(id);
    try {
      const res = await fetch(`/api/storybooks/${id}/narrate`, {
        method: "POST",
        headers: { "x-admin-code": ADMIN_CODE },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.hint || "Narration failed");
      toast.success("Narration ready");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Narration failed");
    } finally {
      setNarratingId(null);
    }
  }

  async function renderPremiumMovie(id: string, force = false) {
    setRenderingId(id);
    toast.message("Order in 🍕 Domino tracker starting…");
    try {
      const res = await fetch(`/api/admin/storybooks/${id}/render-movie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": ADMIN_CODE,
        },
        body: JSON.stringify({
          package: "full",
          force,
          generateNarrationIfMissing: true,
          mode: "async",
        }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 202) {
        throw new Error(data.error || "Render failed");
      }
      if (data.reused) toast.success("Movie already ready");
      else if (data.video_url) toast.success("MP4 ready");
      else toast.success("In the oven — watch the pizza tracker");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Render failed");
      await load();
    } finally {
      setRenderingId(null);
    }
  }

  function copyImages(job: Job) {
    const text = job.page_images.join("\n");
    navigator.clipboard.writeText(text || "(no images)");
    toast.success("Page image URLs copied");
  }

  function copyScript(job: Job) {
    navigator.clipboard.writeText(job.narration_script || "");
    toast.success("Narration script copied");
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "#F8F4EC" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#0A1628" }}>
              🎬 Animated Movie Queue
            </h1>
            <p className="text-gray-500 mt-1">
              Premium movie ($2–3k gift tier): Seedance animates each page → stitch
              → ElevenLabs narration → downloadable MP4.
            </p>
            <p className="text-xs text-emerald-800 mt-1 max-w-xl">
              Tap <strong>Render premium MP4</strong> on a job (10–25 min). Or paste
              a Final MP4 URL manually. Slideshow is only a temporary preview.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #B98A19, #d4a843)" }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading jobs…
          </div>
        ) : error ? (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-sm text-gray-600 mb-3">
              One-time Supabase setup needed. Open SQL Editor and run the migration
              below (adds video + narration columns).
            </p>
            <a
              href="https://supabase.com/dashboard/project/cpnnztrqgbxledbikpqt/sql/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white mb-3"
              style={{ background: "#0A1628" }}
            >
              Open Supabase SQL Editor
            </a>
            <button
              onClick={() => {
                const sql = `ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_requested_at TIMESTAMPTZ;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_delivered_at TIMESTAMPTZ;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_package TEXT;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_notes TEXT;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_contact_email TEXT;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS video_contact_name TEXT;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS narration_url TEXT;
ALTER TABLE public.storybooks ADD COLUMN IF NOT EXISTS narration_script TEXT;
CREATE INDEX IF NOT EXISTS idx_storybooks_video_status ON public.storybooks(video_status);`;
                navigator.clipboard.writeText(sql);
                toast.success("SQL copied — paste in Supabase SQL Editor");
              }}
              className="block mx-auto text-amber-700 font-semibold mb-2"
            >
              Copy SQL migration
            </button>
            <button onClick={load} className="text-gray-500 text-sm hover:underline">
              Try again after running SQL
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
            No movie requests yet. Parents tap “Animate my book” on a share
            link.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const role = job.gender === "boy" ? "King" : "Queen";
              const d = drafts[job.id] || {
                status: job.video_status,
                url: job.video_url || "",
                notes: "",
              };
              const tracker = parseMovieTracker(job.video_notes);
              const showTracker =
                Boolean(tracker) &&
                (job.video_status === "in_production" ||
                  tracker?.step === "failed" ||
                  (tracker?.step === "done" && !job.video_url));
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex gap-4 items-start">
                    <div
                      className="w-16 h-20 rounded-lg overflow-hidden shrink-0"
                      style={{ background: "#0A1628" }}
                    >
                      {job.preview_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={job.preview_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          👑
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900">
                        {role} {job.child_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Age {job.child_age} · {job.page_count} pages ·{" "}
                        {job.video_package || "full"}
                        {job.video_requested_at
                          ? ` · requested ${new Date(
                              job.video_requested_at
                            ).toLocaleString()}`
                          : ""}
                      </p>
                      {(job.video_contact_email || job.video_contact_name) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {job.video_contact_name} {job.video_contact_email}
                        </p>
                      )}
                      {showTracker && tracker ? (
                        <DominoTracker tracker={tracker} />
                      ) : null}
                      {job.video_status === "in_production" && !tracker ? (
                        <div className="mt-3 text-xs font-semibold text-amber-800 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          In the oven — tracker warming up…
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Link
                          href={`/book/${job.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open book
                        </Link>
                        <Link
                          href={`/book/${job.id}?play=1`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Play slideshow now
                        </Link>
                        {job.video_url ? (
                          <a
                            href={job.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                          >
                            <Film className="w-3.5 h-3.5" /> Watch delivered MP4
                          </a>
                        ) : null}
                        <button
                          onClick={() => copyImages(job)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy page images
                        </button>
                        {job.narration_script ? (
                          <button
                            onClick={() => copyScript(job)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:underline"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy script
                          </button>
                        ) : null}
                        <button
                          onClick={() =>
                            renderPremiumMovie(job.id, Boolean(job.video_url))
                          }
                          disabled={renderingId === job.id}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline disabled:opacity-50"
                          title="Seedance + stitch + narration → real MP4"
                        >
                          {renderingId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          {renderingId === job.id
                            ? "Rendering MP4…"
                            : job.video_url
                              ? "Re-render premium MP4"
                              : "Render premium MP4"}
                        </button>
                        <button
                          onClick={() => generateNarration(job.id)}
                          disabled={narratingId === job.id}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                        >
                          {narratingId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mic className="w-3.5 h-3.5" />
                          )}
                          {job.narration_url
                            ? "Regen narration"
                            : "Generate narration"}
                        </button>
                        {job.narration_url ? (
                          <a
                            href={job.narration_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-gray-600 hover:underline"
                          >
                            Play narration
                          </a>
                        ) : null}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-2 mt-4">
                        <label className="text-xs text-gray-500">
                          Status
                          <select
                            value={d.status}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [job.id]: { ...d, status: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs text-gray-500 sm:col-span-2">
                          Final MP4 URL
                          <input
                            value={d.url}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [job.id]: { ...d, url: e.target.value },
                              }))
                            }
                            placeholder="https://…/movie.mp4"
                            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                          />
                        </label>
                      </div>
                      <label className="block text-xs text-gray-500 mt-2">
                        Production notes
                        <textarea
                          value={d.notes}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [job.id]: { ...d, notes: e.target.value },
                            }))
                          }
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                          placeholder="Higgsfield / Seedance notes…"
                        />
                      </label>
                      <button
                        onClick={() => saveJob(job.id)}
                        disabled={savingId === job.id}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                        style={{
                          background:
                            "linear-gradient(135deg, #0A1628, #2D1B4E)",
                        }}
                      >
                        {savingId === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save / deliver
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
