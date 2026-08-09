/**
 * Storybook movie engine — cost-tiered for $150 video SKU.
 *
 * HARD RULES (Justin 2026-08-09):
 * - Target COGS <= $15 / video (stretch) · hard max $50
 * - Testing loop = DRAFT (still-hold)
 * - Paid delivery = STANDARD (Seedance Fast 720p + per-page narration)
 * - Premium blocked unless ALLOW_PREMIUM_MOVIE=1
 *
 * Product fixes (2026-08-09 feedback):
 * 1) Movie must cover FULL narration (no 30s hard cut / blank tail)
 * 2) Narration must match the on-screen page (per-page TTS + timed holds)
 * 3) Standard tries Seedance every page; if it fails, still-hold keeps art on screen
 * 4) End bump/card full-bleed 16:9 — no black side pillars
 * 5) Keyframe duration NEVER exceeds real media length (blank-frame root cause)
 */

import type { StoryPage } from "./types";
import { stripRedundantTitlePages } from "./adventure-paths";
import { generateNarrationAudio } from "./narration";

const FAL_QUEUE = "https://queue.fal.run";
const SEEDANCE_PREMIUM = "bytedance/seedance-2.0/image-to-video";
const SEEDANCE_FAST = "bytedance/seedance-2.0/fast/image-to-video";
const COMPOSE_MODEL = "fal-ai/ffmpeg-api/compose";
const MERGE_AV_MODEL = "fal-ai/ffmpeg-api/merge-audio-video";
const MERGE_VIDEOS_MODEL = "fal-ai/ffmpeg-api/merge-videos";
const METADATA_MODEL = "fal-ai/ffmpeg-api/metadata";
const STILL_MODEL = "fal-ai/ffmpeg-api/images-to-video";

/**
 * Full-bleed 16:9 end card (preferred).
 * Square animated logo MP4 causes black pillars when composed into 16:9 — avoid by default.
 */
const MOVIE_END_BUMP_URL =
  process.env.MOVIE_END_BUMP_URL ||
  "https://www.storybookphotos.com/brand/movie-end-bump.mp4";
const MOVIE_END_CARD_URL =
  process.env.MOVIE_END_CARD_URL ||
  "https://www.storybookphotos.com/brand/movie-end-card-16x9.png";
/** Always try Justin's logo bump video; scale into 16:9 via merge-videos. */
const USE_END_BUMP = process.env.DISABLE_END_BUMP !== "1";
const END_CARD_DURATION_SEC = Number(process.env.MOVIE_END_CARD_SEC || 5);
const END_BUMP_DURATION_SEC = Number(process.env.MOVIE_END_BUMP_SEC || 10);
const MOVIE_WIDTH = 1280;
const MOVIE_HEIGHT = 720;

export type MovieQuality = "draft" | "fast" | "standard" | "premium";
export type MoviePackage = "teaser" | "full";

export const VIDEO_COGS_TARGET_USD = 15;
export const VIDEO_COGS_MAX_USD = 50;

const SEEDANCE_FAST_USD_PER_SEC = 0.242;
const SEEDANCE_PREMIUM_USD_PER_SEC = 0.68;

/** Beats kept modest so Seedance can finish before serverless timeout. */
export const STANDARD_MAX_CLIPS = 8;
export const STANDARD_SEC_PER_CLIP = 6;
export const STANDARD_MIN_SEC_PER_CLIP = 5;
export const STANDARD_MAX_SEC_PER_CLIP = 8;

export function estimateMotionCostUsd(opts: {
  quality: MovieQuality;
  clips: number;
  secPerClip: number;
}): number {
  const q = opts.quality === "fast" ? "standard" : opts.quality;
  const secs = Math.max(0, opts.clips) * Math.max(0, opts.secPerClip);
  if (q === "draft") return 0.5;
  if (q === "standard") return secs * SEEDANCE_FAST_USD_PER_SEC + 2;
  return secs * SEEDANCE_PREMIUM_USD_PER_SEC + 2;
}

export function assertUnderBudget(opts: {
  quality: MovieQuality;
  clips: number;
  secPerClip: number;
  allowPremium?: boolean;
}):
  | { ok: true; estimate: number }
  | { ok: false; estimate: number; reason: string } {
  const q = opts.quality === "fast" ? "standard" : opts.quality;
  if (q === "premium" && !opts.allowPremium) {
    const estimate = estimateMotionCostUsd({ ...opts, quality: "premium" });
    return {
      ok: false,
      estimate,
      reason:
        "Premium blocked for $150 video (>$50 COGS risk). Use draft for testing or standard for delivery.",
    };
  }
  const estimate = estimateMotionCostUsd({
    quality: q,
    clips: opts.clips,
    secPerClip: opts.secPerClip,
  });
  if (estimate > VIDEO_COGS_MAX_USD) {
    return {
      ok: false,
      estimate,
      reason: `Estimated $${estimate.toFixed(0)} exceeds $${VIDEO_COGS_MAX_USD} hard COGS cap.`,
    };
  }
  return { ok: true, estimate };
}

function falKey(): string | null {
  return process.env.FAL_KEY ?? process.env.FAL_API_KEY ?? null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function falQueueResult(
  model: string,
  input: Record<string, unknown>,
  opts?: { timeoutMs?: number; pollMs?: number }
): Promise<Record<string, unknown>> {
  const key = falKey();
  if (!key) throw new Error("FAL_KEY / FAL_API_KEY not set");

  const timeoutMs = opts?.timeoutMs ?? 12 * 60_000;
  const pollMs = opts?.pollMs ?? 2500;
  const started = Date.now();

  const submit = await fetch(`${FAL_QUEUE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!submit.ok) {
    const t = await submit.text();
    throw new Error(
      `fal submit ${model} failed: ${submit.status} ${t.slice(0, 400)}`
    );
  }

  const submitted = (await submit.json()) as {
    request_id?: string;
    status_url?: string;
    response_url?: string;
  };
  const requestId = submitted.request_id;
  if (!requestId) {
    if ((submitted as { video?: { url?: string } }).video?.url) {
      return submitted as Record<string, unknown>;
    }
    throw new Error(`fal submit ${model}: missing request_id`);
  }

  const statusUrl =
    submitted.status_url ||
    `${FAL_QUEUE}/${model}/requests/${requestId}/status`;
  const resultUrl =
    submitted.response_url || `${FAL_QUEUE}/${model}/requests/${requestId}`;

  while (Date.now() - started < timeoutMs) {
    const st = await fetch(statusUrl, {
      headers: { Authorization: `Key ${key}` },
    });
    if (!st.ok) {
      await sleep(pollMs);
      continue;
    }
    const status = (await st.json()) as { status?: string };
    if (status.status === "COMPLETED") {
      const res = await fetch(resultUrl, {
        headers: { Authorization: `Key ${key}` },
      });
      if (!res.ok) {
        throw new Error(
          `fal result ${model}: ${res.status} ${await res.text()}`
        );
      }
      return (await res.json()) as Record<string, unknown>;
    }
    if (status.status === "FAILED" || status.status === "ERROR") {
      throw new Error(
        `fal ${model} failed: ${JSON.stringify(status).slice(0, 500)}`
      );
    }
    await sleep(pollMs);
  }

  throw new Error(`fal ${model} timed out after ${timeoutMs}ms`);
}

function isHttpUrl(u?: string | null): u is string {
  return Boolean(u && /^https?:\/\//i.test(u));
}

function extractVideoUrl(result: Record<string, unknown>): string | null {
  const url =
    (result as { video?: { url?: string } }).video?.url ||
    (result as { video_url?: string }).video_url;
  return typeof url === "string" && url ? url : null;
}

async function probeMedia(url: string): Promise<{
  durationSec?: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
}> {
  try {
    const result = await falQueueResult(
      METADATA_MODEL,
      { media_url: url },
      { timeoutMs: 90_000, pollMs: 1200 }
    );
    const media =
      (result as { media?: Record<string, unknown> }).media || result;
    const duration =
      typeof (media as { duration?: number }).duration === "number"
        ? (media as { duration: number }).duration
        : undefined;
    const res = (
      media as {
        resolution?: {
          width?: number;
          height?: number;
          aspect_ratio?: string;
        };
      }
    ).resolution;
    return {
      durationSec: duration,
      width: res?.width,
      height: res?.height,
      aspectRatio: res?.aspect_ratio,
    };
  } catch {
    return {};
  }
}

function estimateNarrationSec(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // ~130 wpm bedtime + breath
  return Math.max(4, Math.min(18, words / 2.15 + 1.4));
}

/** One short line per page so voice matches the picture. */
export function buildPageNarrationLine(
  page: StoryPage,
  childName: string,
  role: "King" | "Queen"
): string {
  const title = (page.title || "").trim();
  let body = (page.text || "").trim().replace(/\s+/g, " ");
  // Drop pure title-page duplicates
  if (!body || /^title page$/i.test(title)) {
    return `${role} ${childName} continues the adventure.`;
  }
  // Keep TTS short enough for a single shot
  if (body.length > 380) body = body.slice(0, 360).replace(/\s+\S*$/, "") + ".";
  if (title && !body.toLowerCase().startsWith(title.toLowerCase()) && title.length < 48) {
    return `${title}. ${body}`;
  }
  return body;
}

export const STORYBOOK_MOVIE_MOTION_BIBLE = [
  "STYLE LOCK: 2D watercolor children's storybook illustration coming gently alive.",
  "Same animation language on every quest / every page — consistent movie engine.",
  "Feel like a soft classic storybook adventure short (Winnie-the-Pooh warmth, picture-book cinema).",
  "NOT anime. NOT 3D CGI. NOT photoreal live-action. NOT hyper-kinetic action trailer.",
  "Preserve exact art: soft sepia ink outlines, pastel watercolor washes, cream paper texture.",
  "Face/identity LOCKED — no morphing, no warping, no age drift, no facial smear.",
  "Camera: slow gentle push-in OR tiny parallax drift only. No whip pans. No shake-cam.",
  "Motion vocabulary (reuse every page): soft breeze on hair/cape/leaves, cloth drift, lantern glow pulse,",
  "cloud/sky drift, sparkle dust motes, character breathes/blinks subtly, small hand or head turn.",
  "If the scene is action (bridge/climb/storm), show gentle storybook version of that action — readable, calm pacing.",
  "Keep bold outlines sharp and colors stable. No realistic skin pores, no cinematic CGI lighting.",
  "No text, letters, subtitles, watermark, logo, or UI.",
  "Wholesome bedtime adventure energy — magical but safe.",
  "Output must feel ANIMATED, not a frozen still photo.",
].join(" ");

export function buildMotionPrompt(
  page: StoryPage,
  childName: string,
  role: "King" | "Queen"
): string {
  const beat = (page.title || page.text || "magical kingdom scene").slice(0, 180);
  return [
    STORYBOOK_MOVIE_MOTION_BIBLE,
    `Hero is ${role} ${childName} — keep likeness and locked royal outfit stable.`,
    `This shot beat: ${beat}.`,
    `Animate this single storybook frame into a short continuous movie moment with clear gentle motion.`,
  ].join(" ");
}

function selectPages(
  all: StoryPage[],
  packageKind: MoviePackage,
  quality: MovieQuality,
  notes: string[]
): StoryPage[] {
  let pages = all;

  if (quality === "draft") {
    const max = packageKind === "teaser" ? 5 : 8;
    if (pages.length > max) {
      const idxs = evenlyPick(pages.length, max);
      pages = idxs.map((i) => pages[i]);
      notes.push(`Draft package: ${pages.length} still-hold beats (cheap)`);
    }
    return pages;
  }

  const max = packageKind === "teaser" ? 6 : STANDARD_MAX_CLIPS;
  if (pages.length > max) {
    const idxs = evenlyPick(pages.length, max);
    pages = idxs.map((i) => pages[i]);
  }
  const est = estimateMotionCostUsd({
    quality: quality === "premium" ? "premium" : "standard",
    clips: pages.length,
    secPerClip: STANDARD_SEC_PER_CLIP,
  });
  notes.push(
    `${quality} movie: ${pages.length} animated beats (est motion ~$${est.toFixed(0)}, target $${VIDEO_COGS_TARGET_USD}, max $${VIDEO_COGS_MAX_USD})`
  );
  return pages;
}

function evenlyPick(n: number, k: number): number[] {
  if (k >= n) return Array.from({ length: n }, (_, i) => i);
  if (k <= 1) return [0];
  const out: number[] = [];
  for (let i = 0; i < k; i++) {
    out.push(Math.round((i * (n - 1)) / (k - 1)));
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

export type RenderMovieProgress = {
  stage: string;
  detail?: string;
  clipsDone?: number;
  clipsTotal?: number;
};

export type RenderMovieResult = {
  videoUrl: string;
  clipUrls: string[];
  silentVideoUrl?: string;
  pagesUsed: number;
  provider: string;
  quality: MovieQuality;
  notes: string[];
  totalDurationSec?: number;
};

async function stillHoldClip(
  imageUrl: string,
  durationSec: number
): Promise<string> {
  const still = await falQueueResult(
    STILL_MODEL,
    {
      fps: 24,
      images: [
        {
          url: imageUrl,
          frames: Math.max(24, Math.round(durationSec * 24)),
        },
      ],
    },
    { timeoutMs: 5 * 60_000 }
  );
  const url = extractVideoUrl(still);
  if (!url) throw new Error("still hold missing url");
  return url;
}

/** Stretch/pad a short clip so picture holds while narration finishes. */
async function extendClipToDuration(
  clipUrl: string,
  targetSec: number,
  notes: string[],
  index: number
): Promise<string> {
  const meta = await probeMedia(clipUrl);
  const have = meta.durationSec || 0;
  if (have >= targetSec - 0.35) return clipUrl;

  // Loop the short animated clip to cover narration length (keeps motion, no freeze-only)
  const loops = Math.min(4, Math.max(2, Math.ceil(targetSec / Math.max(have, 1))));
  try {
    const urls = Array.from({ length: loops }, () => clipUrl);
    const merged = await falQueueResult(
      MERGE_VIDEOS_MODEL,
      {
        video_urls: urls,
        target_fps: 24,
        resolution: { width: MOVIE_WIDTH, height: MOVIE_HEIGHT },
      },
      { timeoutMs: 6 * 60_000 }
    );
    const url = extractVideoUrl(merged);
    if (!url) throw new Error("loop merge missing url");
    // If still short/long, compose will cut by keyframe duration
    notes.push(
      `clip ${index + 1}: looped ${loops}x to cover ~${targetSec.toFixed(1)}s narration (base ${have.toFixed(1)}s)`
    );
    return url;
  } catch (err) {
    notes.push(
      `clip ${index + 1}: loop extend failed, using base clip (${err instanceof Error ? err.message : String(err)})`.slice(
        0,
        160
      )
    );
    return clipUrl;
  }
}

async function animatePage(options: {
  page: StoryPage;
  childName: string;
  role: "King" | "Queen";
  duration: number;
  quality: MovieQuality;
  notes: string[];
  index: number;
}): Promise<string | null> {
  const { page, childName, role, duration, quality, notes, index } = options;
  const imageUrl = page.imageUrl!;

  // Draft = still only (cheap QA)
  if (quality === "draft") {
    try {
      const url = await stillHoldClip(imageUrl, duration);
      notes.push(`clip ${index + 1}: draft still-hold (${duration}s)`);
      return url;
    } catch (err) {
      notes.push(
        `clip ${index + 1} draft failed: ${err instanceof Error ? err.message : String(err)}`
      );
      return null;
    }
  }

  const usePremium = quality === "premium";
  const model = usePremium ? SEEDANCE_PREMIUM : SEEDANCE_FAST;
  const prompt = buildMotionPrompt(page, childName, role);
  // Keep Seedance clips short (faster + cheaper); loop if narration longer
  const seedanceSec = 5;

  const trySeedance = async (label: string, input: Record<string, unknown>) => {
    const result = await falQueueResult(model, input, {
      timeoutMs: 12 * 60_000,
      pollMs: 4000,
    });
    const url = extractVideoUrl(result);
    if (!url) throw new Error(`${label}: no video url`);
    notes.push(`clip ${index + 1}: ${label} animated (${seedanceSec}s)`);
    return url;
  };

  let url: string | null = null;
  try {
    // Minimal known-good Seedance payload (proven via live API test)
    url = await trySeedance(usePremium ? "Seedance premium" : "Seedance Fast", {
      prompt,
      image_url: imageUrl,
      resolution: "720p",
      duration: String(seedanceSec),
      aspect_ratio: "16:9",
      generate_audio: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    notes.push(`clip ${index + 1} seedance fail: ${msg.slice(0, 120)}`);
    try {
      url = await trySeedance("Seedance Fast retry", {
        prompt: `Gentle storybook motion. Slow push-in. Soft breeze on hair and cape. Sparkles. Hero ${role} ${childName}. Watercolor page comes alive. No text.`,
        image_url: imageUrl,
        duration: "5",
      });
    } catch (e2) {
      notes.push(
        `clip ${index + 1} seedance retry fail: ${e2 instanceof Error ? e2.message : String(e2)}`.slice(
          0,
          140
        )
      );
    }
  }

  // ALWAYS keep a picture on screen — still-hold if Seedance fails (never skip / blank)
  if (!url) {
    try {
      url = await stillHoldClip(imageUrl, Math.max(duration, seedanceSec));
      notes.push(
        `clip ${index + 1}: STILL fallback (${Math.max(duration, seedanceSec)}s) — Seedance unavailable`
      );
    } catch (e3) {
      notes.push(
        `clip ${index + 1} dropped: ${e3 instanceof Error ? e3.message : String(e3)}`
      );
      return null;
    }
  } else if (duration > seedanceSec + 0.5) {
    url = await extendClipToDuration(url, duration, notes, index);
  }
  return url;
}

async function makeFullBleedEndCard(notes: string[]): Promise<{
  url: string;
  durationMs: number;
}> {
  // Prefer Justin's logo bump video, forced into 16:9 canvas via merge-videos scale.
  if (USE_END_BUMP && isHttpUrl(MOVIE_END_BUMP_URL)) {
    try {
      const scaled = await falQueueResult(
        MERGE_VIDEOS_MODEL,
        {
          video_urls: [MOVIE_END_BUMP_URL],
          target_fps: 24,
          resolution: { width: MOVIE_WIDTH, height: MOVIE_HEIGHT },
        },
        { timeoutMs: 6 * 60_000 }
      );
      const url = extractVideoUrl(scaled);
      if (url) {
        const meta = await probeMedia(url);
        const dur = meta.durationSec || END_BUMP_DURATION_SEC;
        notes.push(
          `end bump: logo video scaled to ${MOVIE_WIDTH}x${MOVIE_HEIGHT} (~${dur.toFixed(1)}s)`
        );
        return { url, durationMs: Math.max(3, dur) * 1000 };
      }
    } catch (err) {
      notes.push(
        `end bump scale failed: ${err instanceof Error ? err.message : String(err)}`.slice(
          0,
          140
        )
      );
    }
  }

  notes.push("end card: full-bleed 16:9 logo still");
  const endUrl = await stillHoldClip(MOVIE_END_CARD_URL, END_CARD_DURATION_SEC);
  return { url: endUrl, durationMs: END_CARD_DURATION_SEC * 1000 };
}

/** If audio is longer than picture, pad with end-card holds so screen never goes blank. */
async function padVideoToAudio(
  videoUrl: string,
  audioUrl: string,
  notes: string[]
): Promise<string> {
  const [vMeta, aMeta] = await Promise.all([
    probeMedia(videoUrl),
    probeMedia(audioUrl),
  ]);
  const v = vMeta.durationSec || 0;
  const a = aMeta.durationSec || 0;
  notes.push(`pad_check video=${v.toFixed(1)}s audio=${a.toFixed(1)}s`);
  if (!a || a <= v + 0.75) return videoUrl;

  const need = a - v + 1.0;
  const padSec = Math.min(30, Math.max(END_CARD_DURATION_SEC, need));
  notes.push(`padding picture +${padSec.toFixed(1)}s so narration never outruns video`);
  try {
    const padClip = await stillHoldClip(MOVIE_END_CARD_URL, padSec);
    const merged = await falQueueResult(
      MERGE_VIDEOS_MODEL,
      {
        video_urls: [videoUrl, padClip],
        target_fps: 24,
        resolution: { width: MOVIE_WIDTH, height: MOVIE_HEIGHT },
      },
      { timeoutMs: 8 * 60_000 }
    );
    const url = extractVideoUrl(merged);
    if (!url) throw new Error("pad merge missing url");
    return url;
  } catch (err) {
    notes.push(
      `pad failed: ${err instanceof Error ? err.message : String(err)}`.slice(0, 140)
    );
    return videoUrl;
  }
}

/**
 * Render a downloadable MP4 from storybook pages.
 * Standard = animated Seedance + per-page narration sync + full-bleed end card.
 */
export async function renderPremiumStoryMovie(options: {
  childName: string;
  gender: string;
  pages: StoryPage[];
  narrationUrl?: string | null;
  /** Optional whole-book script (used only if per-page fails). */
  narrationScript?: string | null;
  package?: MoviePackage;
  quality?: MovieQuality;
  coverImageUrl?: string | null;
  /** Upload data: / binary narration so fal can fetch HTTPS URLs. */
  uploadAudio?: (bytes: Buffer, filename: string) => Promise<string | null>;
  onProgress?: (p: RenderMovieProgress) => void;
}): Promise<RenderMovieResult> {
  const key = falKey();
  if (!key) {
    throw new Error("FAL_KEY / FAL_API_KEY required for movie render");
  }

  const role = options.gender === "girl" ? "Queen" : "King";
  const packageKind = options.package ?? "full";
  let quality: MovieQuality = options.quality ?? "standard";
  if (quality === "fast") quality = "standard";

  const allowPremium =
    process.env.ALLOW_PREMIUM_MOVIE === "1" ||
    process.env.ALLOW_PREMIUM_MOVIE === "true";

  if (quality === "premium" && !allowPremium) {
    throw new Error(
      "Premium disabled. For testing use draft. For $150 delivery use standard."
    );
  }

  const notes: string[] = [
    `quality=${quality}`,
    `package=${packageKind}`,
    `canvas=${MOVIE_WIDTH}x${MOVIE_HEIGHT}`,
    `cogs_target_usd=${VIDEO_COGS_TARGET_USD}`,
    `cogs_max_usd=${VIDEO_COGS_MAX_USD}`,
  ];

  let pages = stripRedundantTitlePages(options.pages || []).filter((p) =>
    isHttpUrl(p.imageUrl)
  );
  if (!pages.length) {
    throw new Error("No page images available to animate");
  }
  pages = selectPages(pages, packageKind, quality, notes);

  // Budget against average clip length
  const budget = assertUnderBudget({
    quality,
    clips: pages.length,
    secPerClip: STANDARD_SEC_PER_CLIP,
    allowPremium,
  });
  notes.push(`cost_estimate_usd≈${budget.estimate.toFixed(2)}`);
  if (!budget.ok) throw new Error(budget.reason);

  const onProgress = options.onProgress ?? (() => undefined);

  // ── Per-page narration (sync voice to picture) ──────────────────────────
  type Beat = {
    page: StoryPage;
    text: string;
    audioUrl?: string;
    targetSec: number;
  };
  const beats: Beat[] = pages.map((page) => {
    const text = buildPageNarrationLine(page, options.childName, role);
    return {
      page,
      text,
      targetSec:
        quality === "draft"
          ? 5
          : Math.min(
              STANDARD_MAX_SEC_PER_CLIP,
              Math.max(STANDARD_MIN_SEC_PER_CLIP, estimateNarrationSec(text))
            ),
    };
  });

  const requireSound = quality === "standard" || quality === "premium";
  if (requireSound || quality === "draft") {
    onProgress({
      stage: "audio",
      detail: "Recording per-page bedtime narration…",
      clipsDone: 0,
      clipsTotal: beats.length,
    });
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      try {
        const audio = await generateNarrationAudio({
          text: beat.text,
          filename: `${options.childName}-p${i + 1}.mp3`,
        });
        let publicAudio: string | null = null;
        if (audio.audioUrl && isHttpUrl(audio.audioUrl)) {
          publicAudio = audio.audioUrl;
        } else if (
          audio.audioUrl?.startsWith("data:audio") &&
          options.uploadAudio
        ) {
          const base64 = audio.audioUrl.split(",")[1] ?? "";
          const bytes = Buffer.from(base64, "base64");
          publicAudio = await options.uploadAudio(
            bytes,
            `${options.childName.replace(/\s+/g, "-").toLowerCase()}-p${i + 1}-${Date.now()}.mp3`
          );
        }
        if (publicAudio && isHttpUrl(publicAudio)) {
          beat.audioUrl = publicAudio;
          const meta = await probeMedia(publicAudio);
          if (meta.durationSec && meta.durationSec > 2) {
            beat.targetSec = Math.min(
              STANDARD_MAX_SEC_PER_CLIP + 2,
              Math.max(STANDARD_MIN_SEC_PER_CLIP, meta.durationSec + 0.6)
            );
          }
          notes.push(
            `narration page ${i + 1}: ok ~${beat.targetSec.toFixed(1)}s (${audio.provider})`
          );
        } else {
          notes.push(
            `narration page ${i + 1} failed: ${audio.error || "no public url"}`
          );
        }
      } catch (err) {
        notes.push(
          `narration page ${i + 1} error: ${err instanceof Error ? err.message : String(err)}`.slice(
            0,
            140
          )
        );
      }
      onProgress({
        stage: "audio",
        detail: `Narration ${i + 1}/${beats.length}`,
        clipsDone: i + 1,
        clipsTotal: beats.length,
      });
    }
  }

  const pageAudioCount = beats.filter((b) => isHttpUrl(b.audioUrl)).length;
  if (requireSound && pageAudioCount === 0 && !isHttpUrl(options.narrationUrl)) {
    throw new Error(
      "No per-page narration produced — refusing silent/unsynced customer movie"
    );
  }
  notes.push(
    `narration_sync: ${pageAudioCount}/${beats.length} pages with timed voice`
  );

  onProgress({
    stage: "animating",
    detail: `Animating ${beats.length} storybook pages…`,
    clipsDone: 0,
    clipsTotal: beats.length,
  });

  const clipUrls: string[] = [];
  const clipDurationsMs: number[] = [];
  const audioKeyframes: Array<{
    timestamp: number;
    duration: number;
    url: string;
  }> = [];
  let timelineMs = 0;

  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const duration = beat.targetSec;

    onProgress({
      stage: "animating",
      detail: `Page ${i + 1}/${beats.length}: ${beat.page.title || "scene"}`,
      clipsDone: i,
      clipsTotal: beats.length,
    });

    const url = await animatePage({
      page: beat.page,
      childName: options.childName,
      role,
      duration,
      quality,
      notes,
      index: i,
    });

    if (!url) {
      notes.push(`clip ${i + 1}: hard-failed (no still either) — skipped`);
      continue;
    }

    // CRITICAL: keyframe duration must never exceed real media length.
    // Longer keyframes on short MP4s = blank frames while audio keeps playing.
    let mediaUrl = url;
    let meta = await probeMedia(mediaUrl);
    let mediaSec = meta.durationSec || 0;

    // Physically extend/loop clip so picture covers narration need
    if (!mediaSec || mediaSec + 0.35 < duration) {
      mediaUrl = await extendClipToDuration(mediaUrl, duration, notes, i);
      meta = await probeMedia(mediaUrl);
      mediaSec = meta.durationSec || 0;
    }

    // Last resort: full still-hold of the page art for the narration length
    if (!mediaSec || mediaSec + 0.5 < duration) {
      try {
        mediaUrl = await stillHoldClip(beat.page.imageUrl!, duration);
        mediaSec = duration;
        notes.push(
          `clip ${i + 1}: still-hold pad to ${duration.toFixed(1)}s (media was short)`
        );
      } catch {
        /* keep best effort below */
      }
    }

    // Picture keyframe = min(needed, real media). Never invent blank time.
    const pictureSec = Math.max(
      1,
      Math.min(duration, mediaSec > 0 ? mediaSec : duration)
    );
    // If media is longer than narration, keep the full media (no hard cut feel)
    const holdSec =
      mediaSec > duration ? Math.min(mediaSec, duration + 1.5) : pictureSec;
    const pictureMs = Math.round(holdSec * 1000);

    clipUrls.push(mediaUrl);
    clipDurationsMs.push(pictureMs);

    if (isHttpUrl(beat.audioUrl)) {
      audioKeyframes.push({
        timestamp: timelineMs,
        duration: pictureMs,
        url: beat.audioUrl,
      });
    }
    timelineMs += pictureMs;

    onProgress({
      stage: "animating",
      detail: `Finished page ${i + 1}/${beats.length}`,
      clipsDone: i + 1,
      clipsTotal: beats.length,
    });
  }

  if (!clipUrls.length) {
    throw new Error("All page animations failed — cannot build movie");
  }

  // End card full-bleed
  try {
    onProgress({
      stage: "stitching",
      detail: "Adding full-width logo end card…",
      clipsDone: clipUrls.length,
      clipsTotal: beats.length + 1,
    });
    const end = await makeFullBleedEndCard(notes);
    clipUrls.push(end.url);
    clipDurationsMs.push(end.durationMs);
    timelineMs += end.durationMs;
  } catch (err) {
    notes.push(
      `end card failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  onProgress({
    stage: "stitching",
    detail: `Composing ${clipUrls.length} clips (~${Math.round(timelineMs / 1000)}s)`,
  });

  // Build picture track
  let timestamp = 0;
  const videoKeyframes = clipUrls.map((url, i) => {
    const duration = clipDurationsMs[i] ?? 8000;
    const kf = { timestamp, duration, url };
    timestamp += duration;
    return kf;
  });

  const tracks: Array<Record<string, unknown>> = [
    {
      id: "video",
      type: "video",
      keyframes: videoKeyframes,
    },
  ];

  // Prefer timed per-page audio in compose (true sync). Fallback = whole-book merge.
  if (audioKeyframes.length > 0) {
    tracks.push({
      id: "narration",
      type: "audio",
      keyframes: audioKeyframes,
    });
    notes.push(
      `compose audio: ${audioKeyframes.length} timed narration keyframes`
    );
  }

  let composedUrl: string | null = null;
  try {
    const composed = await falQueueResult(
      COMPOSE_MODEL,
      { tracks },
      { timeoutMs: 12 * 60_000, pollMs: 2500 }
    );
    composedUrl = extractVideoUrl(composed);
    if (!composedUrl) throw new Error("compose returned no video_url");
    notes.push(
      `compose ok (${Math.round(timestamp / 1000)}s picture${
        audioKeyframes.length ? " + synced narration" : ""
      })`
    );
  } catch (err) {
    notes.push(
      `compose failed: ${err instanceof Error ? err.message : String(err)}`
    );
    // Fallback: merge-videos then optional whole narration
    try {
      const merged = await falQueueResult(
        MERGE_VIDEOS_MODEL,
        {
          video_urls: clipUrls,
          target_fps: 24,
          resolution: { width: MOVIE_WIDTH, height: MOVIE_HEIGHT },
        },
        { timeoutMs: 10 * 60_000 }
      );
      composedUrl = extractVideoUrl(merged);
      notes.push("fallback merge-videos ok");
    } catch (e2) {
      composedUrl = clipUrls[0];
      notes.push(
        `merge-videos failed: ${e2 instanceof Error ? e2.message : String(e2)}`
      );
    }
  }

  let finalUrl = composedUrl;

  // Build one continuous whole-book narration if per-page timed audio is thin
  let wholeNarration = isHttpUrl(options.narrationUrl)
    ? options.narrationUrl
    : null;
  if (
    !wholeNarration &&
    options.narrationScript &&
    options.narrationScript.length > 40 &&
    (audioKeyframes.length < Math.ceil(beats.length * 0.5) || !audioKeyframes.length)
  ) {
    try {
      onProgress({ stage: "audio", detail: "Building full-book narration fallback…" });
      const audio = await generateNarrationAudio({
        text: options.narrationScript.slice(0, 4500),
        filename: `${options.childName}-full.mp3`,
      });
      if (audio.audioUrl && isHttpUrl(audio.audioUrl)) {
        wholeNarration = audio.audioUrl;
      } else if (audio.audioUrl?.startsWith("data:audio") && options.uploadAudio) {
        const base64 = audio.audioUrl.split(",")[1] ?? "";
        wholeNarration = await options.uploadAudio(
          Buffer.from(base64, "base64"),
          `${options.childName.replace(/\s+/g, "-").toLowerCase()}-full-${Date.now()}.mp3`
        );
      }
      if (wholeNarration) notes.push("whole-book narration ready (fallback)");
    } catch (err) {
      notes.push(
        `whole narration fallback failed: ${err instanceof Error ? err.message : String(err)}`.slice(
          0,
          140
        )
      );
    }
  }

  // If compose did not embed timed audio (or too few pages), merge whole narration
  // BUT first pad picture so audio never outruns video (blank screen bug).
  const composeHasAudio = audioKeyframes.length >= Math.max(1, Math.ceil(beats.length * 0.6));
  if (finalUrl && wholeNarration && !composeHasAudio) {
    try {
      onProgress({ stage: "audio", detail: "Padding picture to full narration length…" });
      finalUrl = await padVideoToAudio(finalUrl, wholeNarration, notes);
      onProgress({ stage: "audio", detail: "Merging full bedtime narration…" });
      const merged = await falQueueResult(
        MERGE_AV_MODEL,
        { video_url: finalUrl, audio_url: wholeNarration },
        { timeoutMs: 8 * 60_000 }
      );
      const murl = extractVideoUrl(merged);
      if (!murl) throw new Error("merge-audio-video returned no url");
      finalUrl = murl;
      notes.push("SOUND: whole-book narration merged after pad");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      notes.push(`SOUND FAILED: ${msg.slice(0, 180)}`);
      if (requireSound) {
        throw new Error(
          `Narration merge failed — refusing silent customer video. ${msg.slice(0, 160)}`
        );
      }
    }
  } else if (composeHasAudio) {
    notes.push("SOUND: timed per-page narration in compose");
    // Still pad if final probe shows audio longer than video
    if (finalUrl && wholeNarration) {
      finalUrl = await padVideoToAudio(finalUrl, wholeNarration, notes);
    }
  } else if (!wholeNarration && audioKeyframes.length === 0) {
    notes.push("SOUND: no narration provided");
  }

  if (finalUrl) {
    const meta = await probeMedia(finalUrl);
    if (meta.durationSec) {
      notes.push(`final_duration_sec=${meta.durationSec.toFixed(1)}`);
    }
  }

  if (!finalUrl) {
    throw new Error("Movie render produced no URL");
  }

  onProgress({ stage: "done", detail: finalUrl });

  const provider =
    quality === "draft"
      ? "draft-still-hold+ffmpeg"
      : quality === "standard"
        ? "standard-seedance-fast-720p+per-page-narration+ffmpeg"
        : "premium-override+ffmpeg";

  return {
    videoUrl: finalUrl,
    clipUrls,
    silentVideoUrl: composedUrl || undefined,
    pagesUsed: pages.length,
    provider,
    quality,
    notes,
    totalDurationSec: timestamp / 1000,
  };
}

/** Persist MP4 into Supabase storage when possible; else keep fal URL. */
export async function persistMovieToStorage(options: {
  supabase: {
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string,
          body: Buffer,
          opts: { contentType: string; upsert: boolean }
        ) => Promise<{ error: { message: string } | null }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
      };
    };
  };
  bookId: string;
  videoUrl: string;
}): Promise<string> {
  try {
    const res = await fetch(options.videoUrl);
    if (!res.ok) return options.videoUrl;
    const buf = Buffer.from(await res.arrayBuffer());
    const path = `movies/${options.bookId}-${Date.now()}.mp4`;
    const { error } = await options.supabase.storage
      .from("storybook-assets")
      .upload(path, buf, { contentType: "video/mp4", upsert: true });
    if (error) {
      console.warn("movie storage upload:", error.message);
      return options.videoUrl;
    }
    const { data } = options.supabase.storage
      .from("storybook-assets")
      .getPublicUrl(path);
    return data.publicUrl || options.videoUrl;
  } catch (err) {
    console.warn("persistMovieToStorage:", err);
    return options.videoUrl;
  }
}
