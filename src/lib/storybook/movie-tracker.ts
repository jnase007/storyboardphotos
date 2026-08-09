/**
 * Domino's-style pizza tracker for premium movie renders.
 * Progress is stored as JSON in storybooks.video_notes (prefix TRACKER|).
 */

export type MovieTrackerStepId =
  | "queued"
  | "prep"
  | "oven"
  | "quality"
  | "delivery"
  | "done"
  | "failed";

export type MovieTrackerState = {
  v: 1;
  tracker: true;
  step: MovieTrackerStepId;
  label: string;
  pct: number; // 0-100
  detail?: string;
  clipsDone?: number;
  clipsTotal?: number;
  startedAt: string;
  updatedAt: string;
  error?: string;
  videoUrl?: string;
};

export const MOVIE_TRACKER_STEPS: Array<{
  id: MovieTrackerStepId;
  title: string;
  blurb: string;
}> = [
  { id: "queued", title: "Order in", blurb: "Movie request received" },
  { id: "prep", title: "Prep", blurb: "Bedtime narration + page lineup" },
  { id: "oven", title: "In the oven", blurb: "Animating each page (Seedance)" },
  { id: "quality", title: "Quality check", blurb: "Stitching cinematic clips" },
  { id: "delivery", title: "Out for delivery", blurb: "Mixing audio + packaging MP4" },
  { id: "done", title: "Delivered", blurb: "Ready to watch & download" },
];

const PREFIX = "TRACKER|";

export function encodeMovieTracker(state: MovieTrackerState): string {
  return PREFIX + JSON.stringify(state);
}

export function parseMovieTracker(
  notes?: string | null
): MovieTrackerState | null {
  if (!notes) return null;
  const raw = notes.trim();
  if (!raw.startsWith(PREFIX)) {
    // allow pure JSON tracker blobs too
    if (raw.startsWith("{") && raw.includes('"tracker"')) {
      try {
        const j = JSON.parse(raw) as MovieTrackerState;
        if (j?.tracker && j.v === 1) return j;
      } catch {
        return null;
      }
    }
    return null;
  }
  try {
    const j = JSON.parse(raw.slice(PREFIX.length)) as MovieTrackerState;
    if (j?.tracker && j.v === 1) return j;
  } catch {
    return null;
  }
  return null;
}

export function stepIndex(step: MovieTrackerStepId): number {
  if (step === "failed") return -1;
  const i = MOVIE_TRACKER_STEPS.findIndex((s) => s.id === step);
  return i < 0 ? 0 : i;
}

export function buildTracker(partial: {
  step: MovieTrackerStepId;
  detail?: string;
  clipsDone?: number;
  clipsTotal?: number;
  startedAt?: string;
  error?: string;
  videoUrl?: string;
  pct?: number;
}): MovieTrackerState {
  const now = new Date().toISOString();
  const startedAt = partial.startedAt || now;

  let pct = partial.pct;
  if (pct == null) {
    const idx = stepIndex(partial.step);
    if (partial.step === "failed") pct = 0;
    else if (partial.step === "done") pct = 100;
    else if (partial.step === "oven" && partial.clipsTotal) {
      const base = 25;
      const span = 45;
      const done = partial.clipsDone ?? 0;
      pct = Math.min(
        70,
        Math.round(base + (done / Math.max(1, partial.clipsTotal)) * span)
      );
    } else {
      const map: Record<MovieTrackerStepId, number> = {
        queued: 5,
        prep: 15,
        oven: 30,
        quality: 75,
        delivery: 90,
        done: 100,
        failed: 0,
      };
      pct = map[partial.step];
    }
  }

  const label =
    MOVIE_TRACKER_STEPS.find((s) => s.id === partial.step)?.title ||
    (partial.step === "failed" ? "Burned batch" : partial.step);

  return {
    v: 1,
    tracker: true,
    step: partial.step,
    label,
    pct,
    detail: partial.detail,
    clipsDone: partial.clipsDone,
    clipsTotal: partial.clipsTotal,
    startedAt,
    updatedAt: now,
    error: partial.error,
    videoUrl: partial.videoUrl,
  };
}
