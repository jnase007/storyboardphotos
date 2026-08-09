"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Film,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  AlertTriangle,
  Play,
  CheckCircle2,
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
  updated_at?: string | null;
};

type Quality = "draft" | "standard" | "premium";

function minutesAgo(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 60000);
}

function jobState(job: Job): {
  kind: "ready" | "cooking" | "stuck" | "queued" | "other";
  label: string;
  color: string;
} {
  if (job.video_url || job.video_status === "ready" || job.video_status === "delivered") {
    return { kind: "ready", label: "Ready to watch", color: "#047857" };
  }
  if (job.video_status === "in_production") {
    const tracker = parseMovieTracker(job.video_notes);
    const age =
      minutesAgo(tracker?.updatedAt) ??
      minutesAgo(tracker?.startedAt) ??
      minutesAgo(job.video_requested_at) ??
      minutesAgo(job.updated_at);
    // Vercel after() dies often — treat long cooks with no URL as stuck
    if (age != null && age >= 25) {
      return {
        kind: "stuck",
        label: `Stuck · ${age}m (server timed out)`,
        color: "#b91c1c",
      };
    }
    return {
      kind: "cooking",
      label: age != null ? `Making movie · ${age}m` : "Making movie…",
      color: "#B98A19",
    };
  }
  if (job.video_status === "requested" || job.video_status === "paid") {
    return { kind: "queued", label: "Waiting for movie", color: "#1d4ed8" };
  }
  return { kind: "other", label: job.video_status || "—", color: "#6b7280" };
}

function SimpleTracker({ tracker }: { tracker: MovieTrackerState }) {
  const failed = tracker.step === "failed";
  return (
    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">
          {failed ? "Failed" : tracker.label}
          {tracker.detail ? ` · ${tracker.detail}` : ""}
        </p>
        <p className="text-sm font-black tabular-nums" style={{ color: "#B98A19" }}>
          {failed ? "—" : `${tracker.pct}%`}
        </p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${failed ? 100 : Math.max(4, tracker.pct)}%`,
            background: failed
              ? "#ef4444"
              : "linear-gradient(90deg,#B98A19,#e8c56a)",
          }}
        />
      </div>
    </div>
  );
}

export function VideoJobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});

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
      const next: Record<string, string> = {};
      for (const j of list) next[j.id] = j.video_url || "";
      setUrlDrafts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cooking = useMemo(
    () => jobs.some((j) => j.video_status === "in_production" && !j.video_url),
    [jobs]
  );
  useEffect(() => {
    if (!cooking) return;
    const t = setInterval(() => {
      void load();
    }, 10000);
    return () => clearInterval(t);
  }, [cooking]);

  async function makeMovie(id: string, quality: Quality, force = false) {
    const labels: Record<Quality, string> = {
      draft: "Test draft (pennies)",
      standard: "Customer coloring-book video (~$10-15)",
      premium: "Premium (blocked)",
    };

    if (quality === "premium") {
      toast.error(
        "Premium is blocked. $150 coloring-book videos use Standard (~$15). Testing uses Draft."
      );
      return;
    }
    if (quality === "standard") {
      const ok = window.confirm(
        "Customer coloring-book video (~$8-$15, max $50).\n\nGentle 2D motion only — not hyper-real.\nUse when the book is approved.\nFor ~30 test passes, use Test draft.\n\nContinue?"
      );
      if (!ok) return;
    }

    setBusyId(id);
    toast.message(`Starting ${labels[quality]}…`);
    try {
      const res = await fetch(`/api/admin/storybooks/${id}/render-movie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": ADMIN_CODE,
        },
        body: JSON.stringify({
          package: "teaser",
          quality,
          force,
          // Always try bedtime narration — this is the product sound
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
      else toast.success("Cooking — this page will refresh");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Render failed");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function markStuckFailed(job: Job) {
    setBusyId(job.id);
    try {
      const res = await fetch(`/api/storybooks/${job.id}/video`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": ADMIN_CODE,
        },
        body: JSON.stringify({
          video_status: "requested",
          video_notes:
            "STUCK cleared — previous Vercel render died mid-job. Make a cheap preview again.",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not clear stuck job");
      toast.success("Unstuck — ready to try again");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setBusyId(null);
    }
  }

  async function removeFromQueue(job: Job) {
    const role = job.gender === "boy" ? "King" : "Queen";
    const ok = window.confirm(
      `Remove ${role} ${job.child_name} from the movie queue?\n\nBook stays.`
    );
    if (!ok) return;
    setBusyId(job.id);
    try {
      const res = await fetch(`/api/storybooks/${job.id}/video`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": ADMIN_CODE,
        },
        body: JSON.stringify({
          video_status: "none",
          video_url: null,
          video_notes: null,
          video_package: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not remove");
      toast.success("Removed from queue");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  async function saveManualUrl(job: Job) {
    const url = (urlDrafts[job.id] || "").trim();
    if (!url) {
      toast.error("Paste an MP4 URL first");
      return;
    }
    setBusyId(job.id);
    try {
      const res = await fetch(`/api/storybooks/${job.id}/video`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": ADMIN_CODE,
        },
        body: JSON.stringify({
          video_status: "ready",
          video_url: url,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("Movie marked ready");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusyId(null);
    }
  }

  const stuckCount = jobs.filter((j) => jobState(j).kind === "stuck").length;

  return (
    <div
      className="min-h-screen px-6 pb-10 pt-24 md:pt-28"
      style={{ background: "#F8F4EC" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#0A1628" }}>
              Movies
            </h1>
            <p className="text-gray-600 mt-1 text-sm max-w-md">
              Every video gets <strong>bedtime narration + sound</strong>. Test
              draft = stills + voice (pennies × 30). Standard = light motion +
              voice (~$10-15, max $50).
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow-sm"
            style={{ background: "linear-gradient(135deg, #B98A19, #d4a843)" }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {stuckCount > 0 ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">
                {stuckCount} movie{stuckCount > 1 ? "s" : ""} stuck
              </p>
              <p className="text-sm text-red-700">
                Server died mid-render (common on long Seedance jobs). Tap{" "}
                <strong>Unstick</strong>, then <strong>Test draft</strong>.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mb-6 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-gray-700">
          <p className="font-semibold text-gray-900 mb-1">How to test without burning cash</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>
              Improve the <strong>book</strong> first (art + story).
            </li>
            <li>
              <strong>Test draft</strong> = pages + story narration/sound (pennies). Do your 30 passes here.
            </li>
            <li>
              When locked, run <strong>one Standard</strong> with light motion + narration (~$10-15, max $50).
            </li>
          </ol>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading…
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-2">{error}</p>
            <button onClick={load} className="text-sm text-gray-600 underline">
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
            No movie requests yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const role = job.gender === "boy" ? "King" : "Queen";
              const state = jobState(job);
              const tracker = parseMovieTracker(job.video_notes);
              const busy = busyId === job.id;
              const advanced = Boolean(showAdvanced[job.id]);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex gap-4">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {role} {job.child_name}
                        </h3>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                          style={{ background: state.color }}
                        >
                          {state.kind === "ready" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : state.kind === "stuck" ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : null}
                          {state.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Age {job.child_age} · {job.page_count} pages
                        {job.video_package ? ` · ${job.video_package}` : ""}
                      </p>

                      {state.kind === "cooking" && tracker ? (
                        <SimpleTracker tracker={tracker} />
                      ) : null}

                      {state.kind === "stuck" ? (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                          This one died on the server. Unstick it, then run{" "}
                          <strong>Test draft</strong> (not customer/premium).
                        </div>
                      ) : null}

                      {/* Primary actions */}
                      <div className="mt-4 flex flex-col gap-2">
                        {job.video_url ? (
                          <a
                            href={job.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, #047857, #10b981)",
                            }}
                          >
                            <Play className="w-4 h-4" />
                            Watch movie
                          </a>
                        ) : null}

                        {state.kind === "stuck" ? (
                          <button
                            onClick={() => markStuckFailed(job)}
                            disabled={busy}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white bg-red-600 disabled:opacity-60"
                          >
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                            Unstick
                          </button>
                        ) : null}

                        {state.kind === "cooking" ? (
                          <p className="text-xs text-amber-800 font-medium">
                            Cooking… page auto-refreshes. If this sits over ~25
                            min, it will show as stuck.
                          </p>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                makeMovie(
                                  job.id,
                                  "draft",
                                  Boolean(job.video_url) || state.kind === "stuck"
                                )
                              }
                              disabled={busy}
                              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                              style={{
                                background:
                                  "linear-gradient(135deg, #0A1628, #2D1B4E)",
                              }}
                            >
                              {busy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              {job.video_url
                                ? "Remake test draft"
                                : "Make test draft"}
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() =>
                                  makeMovie(job.id, "standard", Boolean(job.video_url))
                                }
                                disabled={busy}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900 disabled:opacity-60"
                              >
                                Customer video (~$15)
                              </button>
                              <button
                                onClick={() =>
                                  makeMovie(job.id, "premium", Boolean(job.video_url))
                                }
                                disabled={busy}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-800 disabled:opacity-60"
                              >
                                Premium blocked
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Secondary links */}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                        <Link
                          href={`/book/${job.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-amber-800 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open book
                        </Link>
                        <Link
                          href={`/book/${job.id}?play=1`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-emerald-800 hover:underline"
                        >
                          Play slideshow
                        </Link>
                        <button
                          onClick={() => removeFromQueue(job)}
                          disabled={busy}
                          className="inline-flex items-center gap-1 text-gray-500 hover:underline disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                        <button
                          onClick={() =>
                            setShowAdvanced((p) => ({
                              ...p,
                              [job.id]: !p[job.id],
                            }))
                          }
                          className="text-gray-400 hover:underline"
                        >
                          {advanced ? "Hide advanced" : "Advanced"}
                        </button>
                      </div>

                      {advanced ? (
                        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                          <label className="block text-xs text-gray-500">
                            Paste final MP4 URL (manual deliver)
                            <div className="mt-1 flex gap-2">
                              <input
                                value={urlDrafts[job.id] || ""}
                                onChange={(e) =>
                                  setUrlDrafts((p) => ({
                                    ...p,
                                    [job.id]: e.target.value,
                                  }))
                                }
                                placeholder="https://…/movie.mp4"
                                className="flex-1 rounded-lg border border-gray-200 px-2 py-2 text-sm bg-white"
                              />
                              <button
                                onClick={() => saveManualUrl(job)}
                                disabled={busy}
                                className="rounded-lg px-3 py-2 text-xs font-bold text-white bg-gray-900 disabled:opacity-60"
                              >
                                Save
                              </button>
                            </div>
                          </label>
                          {job.narration_url ? (
                            <a
                              href={job.narration_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-purple-700 hover:underline"
                            >
                              Play narration audio
                            </a>
                          ) : (
                            <p className="text-xs text-gray-400">
                              No narration yet (draft skips it)
                            </p>
                          )}
                          {job.video_notes ? (
                            <pre className="text-[10px] text-gray-500 whitespace-pre-wrap max-h-28 overflow-auto">
                              {job.video_notes.slice(0, 800)}
                            </pre>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* keep unused import happy if tree-shaken differently */}
        <span className="hidden">{MOVIE_TRACKER_STEPS.length}</span>
      </div>
    </div>
  );
}
