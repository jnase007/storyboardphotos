/**
 * Storybook movie engine — cost-tiered for $150 video SKU.
 *
 * HARD RULES (Justin 2026-08-09):
 * - Target COGS <= $15 / video
 * - Hard max COGS = $50 / video
 * - Testing loop (30+ passes) = DRAFT only (pennies)
 * - Paid delivery = STANDARD (Seedance Fast 720p, capped clips)
 * - Premium 1080p blocked unless ALLOW_PREMIUM_MOVIE=1
 *
 * Tiers:
 * - draft    : still-hold slideshow (QA / feedback loop)
 * - standard : Seedance Fast 720p storybook-movie motion, capped clips (~$8-15)
 * - fast     : alias of standard
 * - premium  : blocked by default
 *
 * Animation goal (Justin):
 * Soft classic storybook adventure film energy (Winnie-the-Pooh / picture-book cinema),
 * same motion language every quest — NOT anime, NOT photoreal trailer.
 */

import type { StoryPage } from "./types";
import { stripRedundantTitlePages } from "./adventure-paths";

const FAL_QUEUE = "https://queue.fal.run";
const SEEDANCE_PREMIUM = "bytedance/seedance-2.0/image-to-video";
const SEEDANCE_FAST = "bytedance/seedance-2.0/fast/image-to-video";
const COMPOSE_MODEL = "fal-ai/ffmpeg-api/compose";
const MERGE_AV_MODEL = "fal-ai/ffmpeg-api/merge-audio-video";
const STILL_MODEL = "fal-ai/ffmpeg-api/images-to-video";

/** Public end slate with Storybook Photos branding (logo lockup). */
const MOVIE_END_CARD_URL =
  process.env.MOVIE_END_CARD_URL ||
  "https://www.storybookphotos.com/brand/movie-end-card-v3.png";
const END_CARD_DURATION_SEC = 4;

export type MovieQuality = "draft" | "fast" | "standard" | "premium";
export type MoviePackage = "teaser" | "full";

/** Target COGS for $150 video product. */
export const VIDEO_COGS_TARGET_USD = 15;
/** Hard fail above this estimated motion+stitch COGS. */
export const VIDEO_COGS_MAX_USD = 50;

const SEEDANCE_FAST_USD_PER_SEC = 0.242; // fal Seedance Fast 720p
const SEEDANCE_PREMIUM_USD_PER_SEC = 0.68; // too expensive for $150 SKU

/** Paid $150 shape: stays near $15 target, under $50 hard cap. */
export const STANDARD_MAX_CLIPS = 6;
export const STANDARD_SEC_PER_CLIP = 5;

export function estimateMotionCostUsd(opts: {
  quality: MovieQuality;
  clips: number;
  secPerClip: number;
}): number {
  const q = opts.quality === "fast" ? "standard" : opts.quality;
  const secs = Math.max(0, opts.clips) * Math.max(0, opts.secPerClip);
  if (q === "draft") return 0.4; // still-hold + stitch
  if (q === "standard") return secs * SEEDANCE_FAST_USD_PER_SEC + 1.5;
  return secs * SEEDANCE_PREMIUM_USD_PER_SEC + 2;
}

export function assertUnderBudget(opts: {
  quality: MovieQuality;
  clips: number;
  secPerClip: number;
  allowPremium?: boolean;
}): { ok: true; estimate: number } | { ok: false; estimate: number; reason: string } {
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
    throw new Error(`fal submit ${model} failed: ${submit.status} ${t.slice(0, 400)}`);
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
    submitted.status_url || `${FAL_QUEUE}/${model}/requests/${requestId}/status`;
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
        throw new Error(`fal result ${model}: ${res.status} ${await res.text()}`);
      }
      return (await res.json()) as Record<string, unknown>;
    }
    if (status.status === "FAILED" || status.status === "ERROR") {
      throw new Error(`fal ${model} failed: ${JSON.stringify(status).slice(0, 500)}`);
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

/**
 * Shared movie animation language for EVERY quest.
 * Target feel: classic soft storybook adventure film (Winnie-the-Pooh / picture-book cinema),
 * NOT anime speed lines, NOT photoreal Seedance trailer energy.
 */
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
].join(" ");

/** Motion direction per page — shared engine + page beat. */
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
    `Animate this single storybook frame into a short continuous movie moment.`,
  ].join(" ");
}

function pageDurationSec(
  _page: StoryPage,
  packageKind: MoviePackage,
  quality: MovieQuality
): number {
  if (quality === "draft") {
    return packageKind === "teaser" ? 4 : 5;
  }
  // standard/fast: fixed 5s to hit ~$15 target
  if (quality === "fast" || quality === "standard") {
    return STANDARD_SEC_PER_CLIP;
  }
  return 6; // premium override only
}

function selectPages(
  all: StoryPage[],
  packageKind: MoviePackage,
  quality: MovieQuality,
  notes: string[]
): StoryPage[] {
  let pages = all;

  if (quality === "draft") {
    // Cheap review cut: max 6 beats
    if (packageKind === "teaser" || pages.length > 6) {
      const max = packageKind === "teaser" ? 5 : 6;
      if (pages.length > max) {
        const idxs = [
          0,
          Math.floor(pages.length * 0.25),
          Math.floor(pages.length * 0.5),
          Math.floor(pages.length * 0.75),
          pages.length - 1,
        ];
        if (max >= 6) idxs.splice(3, 0, Math.floor(pages.length * 0.62));
        const uniq = [...new Set(idxs)].sort((a, b) => a - b).slice(0, max);
        pages = uniq.map((i) => pages[i]);
        notes.push(`Draft package: ${pages.length} still-hold beats (cheap)`);
      }
    }
    return pages;
  }

  if (quality === "fast" || quality === "standard") {
    const max = STANDARD_MAX_CLIPS;
    if (pages.length > max) {
      const idxs = [
        0,
        Math.floor(pages.length * 0.2),
        Math.floor(pages.length * 0.4),
        Math.floor(pages.length * 0.6),
        Math.floor(pages.length * 0.8),
        pages.length - 1,
      ];
      const uniq = [...new Set(idxs)].sort((a, b) => a - b).slice(0, max);
      pages = uniq.map((i) => pages[i]);
    }
    const est = estimateMotionCostUsd({
      quality: "standard",
      clips: pages.length,
      secPerClip: STANDARD_SEC_PER_CLIP,
    });
    notes.push(
      `Standard $150 movie: ${pages.length}x${STANDARD_SEC_PER_CLIP}s Fast 720p (est $${est.toFixed(0)}, target $${VIDEO_COGS_TARGET_USD}, max $${VIDEO_COGS_MAX_USD})`
    );
    return pages;
  }

  // premium override — still clamp
  if (pages.length > STANDARD_MAX_CLIPS) {
    const idxs = [
      0,
      Math.floor(pages.length * 0.2),
      Math.floor(pages.length * 0.4),
      Math.floor(pages.length * 0.6),
      Math.floor(pages.length * 0.8),
      pages.length - 1,
    ];
    const uniq = [...new Set(idxs)].sort((a, b) => a - b).slice(0, STANDARD_MAX_CLIPS);
    pages = uniq.map((i) => pages[i]);
    notes.push("Premium clamped to 6 beats (cost guard)");
  }
  return pages;
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
          frames: Math.round(durationSec * 24),
        },
      ],
    },
    { timeoutMs: 5 * 60_000 }
  );
  const url = extractVideoUrl(still);
  if (!url) throw new Error("still hold missing url");
  return url;
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

  // DRAFT: still-hold only (pennies)
  if (quality === "draft") {
    try {
      const url = await stillHoldClip(page.imageUrl!, duration);
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
  const resolution = "720p"; // never 1080p on $150 path

  try {
    // Seedance image-to-video — prompt is the animation director for every quest
    const input: Record<string, unknown> = {
      prompt,
      image_url: page.imageUrl,
      resolution,
      duration: String(
        Math.min(usePremium ? 8 : STANDARD_SEC_PER_CLIP, Math.max(4, duration))
      ),
      aspect_ratio: "16:9",
      generate_audio: false,
      // Prefer calmer motion; narration carries the story energy
      camera_fixed: false,
      bitrate_mode: "standard",
    };

    const result = await falQueueResult(model, input, {
      timeoutMs: 10 * 60_000,
      pollMs: 3000,
    });
    const url = extractVideoUrl(result);
    if (!url) throw new Error(`No video url for page ${index + 1}`);
    notes.push(
      `clip ${index + 1}: ${usePremium ? "Seedance premium" : "Seedance Fast"} ok (${duration}s ${resolution})`
    );
    return url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    notes.push(
      `clip ${index + 1} ${quality} failed → still hold: ${msg.slice(0, 120)}`
    );
    try {
      const url = await stillHoldClip(page.imageUrl!, duration);
      notes.push(`clip ${index + 1}: still-hold fallback (${duration}s)`);
      return url;
    } catch (e2) {
      notes.push(
        `clip ${index + 1} dropped: ${e2 instanceof Error ? e2.message : String(e2)}`
      );
      return null;
    }
  }
}

/**
 * Render a downloadable MP4 from storybook pages.
 * Default quality = draft (cheap still-hold). Premium is opt-in only.
 */
export async function renderPremiumStoryMovie(options: {
  childName: string;
  gender: string;
  pages: StoryPage[];
  narrationUrl?: string | null;
  package?: MoviePackage;
  /** draft (default) | fast | premium */
  quality?: MovieQuality;
  coverImageUrl?: string | null;
  onProgress?: (p: RenderMovieProgress) => void;
}): Promise<RenderMovieResult> {
  const key = falKey();
  if (!key) {
    throw new Error("FAL_KEY / FAL_API_KEY required for movie render");
  }

  const role = options.gender === "girl" ? "Queen" : "King";
  const packageKind = options.package ?? "teaser";
  let quality: MovieQuality = options.quality ?? "draft";
  if (quality === "fast") quality = "standard";

  const allowPremium =
    process.env.ALLOW_PREMIUM_MOVIE === "1" ||
    process.env.ALLOW_PREMIUM_MOVIE === "true";

  if (quality === "premium" && !allowPremium) {
    throw new Error(
      "Premium disabled. For testing use draft (pennies). For $150 delivery use standard (≤$15 target, $50 max). Set ALLOW_PREMIUM_MOVIE=1 only to override."
    );
  }

  const notes: string[] = [
    `quality=${quality}`,
    `package=${packageKind}`,
    `cogs_target_usd=${VIDEO_COGS_TARGET_USD}`,
    `cogs_max_usd=${VIDEO_COGS_MAX_USD}`,
    quality === "draft"
      ? "COST MODE: DRAFT for QA/feedback loop (pennies). Use this for ~30 test videos."
      : quality === "standard"
        ? `COST MODE: STANDARD $150 delivery — Fast 720p, ≤${STANDARD_MAX_CLIPS}x${STANDARD_SEC_PER_CLIP}s, target $${VIDEO_COGS_TARGET_USD}.`
        : "COST MODE: PREMIUM override only.",
  ];

  let pages = stripRedundantTitlePages(options.pages || []).filter((p) =>
    isHttpUrl(p.imageUrl)
  );

  if (!pages.length) {
    throw new Error("No page images available to animate");
  }

  pages = selectPages(pages, packageKind, quality, notes);

  const secPerClip =
    quality === "draft" ? 5 : quality === "premium" ? 6 : STANDARD_SEC_PER_CLIP;
  const budget = assertUnderBudget({
    quality,
    clips: pages.length,
    secPerClip,
    allowPremium,
  });
  notes.push(`cost_estimate_usd≈${budget.estimate.toFixed(2)}`);
  if (!budget.ok) {
    throw new Error(budget.reason);
  }

  const onProgress = options.onProgress ?? (() => undefined);
  const motionLabel =
    quality === "draft"
      ? "still-hold draft"
      : quality === "standard"
        ? "Seedance Fast coloring-book motion (≤$15 target)"
        : "Seedance premium override";

  onProgress({
    stage: "animating",
    detail: `${motionLabel} on ${pages.length} pages`,
    clipsDone: 0,
    clipsTotal: pages.length,
  });

  const clipUrls: string[] = [];
  const clipDurationsMs: number[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const duration = pageDurationSec(page, packageKind, quality);

    onProgress({
      stage: "animating",
      detail: `Page ${i + 1}/${pages.length}: ${page.title || "scene"} (${quality})`,
      clipsDone: i,
      clipsTotal: pages.length,
    });

    const url = await animatePage({
      page,
      childName: options.childName,
      role,
      duration,
      quality,
      notes,
      index: i,
    });

    if (url) {
      clipUrls.push(url);
      clipDurationsMs.push(duration * 1000);
    }

    onProgress({
      stage: "animating",
      detail: `Finished page ${i + 1}/${pages.length}`,
      clipsDone: i + 1,
      clipsTotal: pages.length,
    });
  }

  if (!clipUrls.length) {
    throw new Error("All page animations failed — cannot build movie");
  }

  // Closing slate: Storybook Photos logo end card
  try {
    onProgress({
      stage: "stitching",
      detail: "Adding Storybook Photos end logo…",
      clipsDone: clipUrls.length,
      clipsTotal: pages.length + 1,
    });
    const endUrl = await stillHoldClip(MOVIE_END_CARD_URL, END_CARD_DURATION_SEC);
    clipUrls.push(endUrl);
    clipDurationsMs.push(END_CARD_DURATION_SEC * 1000);
    notes.push(`end card: Storybook Photos logo (${END_CARD_DURATION_SEC}s)`);
  } catch (err) {
    notes.push(
      `end card skipped: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  onProgress({ stage: "stitching", detail: `Composing ${clipUrls.length} clips` });

  // Build silent picture track first (reliable), then ALWAYS merge narration as a second step.
  // fal compose audio tracks are flaky; merge-audio-video is the sound path that matters.
  let timestamp = 0;
  const videoKeyframes = clipUrls.map((url, i) => {
    const duration = clipDurationsMs[i] ?? 8000;
    const kf = { timestamp, duration, url };
    timestamp += duration;
    return kf;
  });

  const videoOnlyTracks = [
    {
      id: "video",
      type: "video",
      keyframes: videoKeyframes,
    },
  ];

  let silentOrFullUrl: string | null = null;
  try {
    const composed = await falQueueResult(
      COMPOSE_MODEL,
      { tracks: videoOnlyTracks },
      { timeoutMs: 10 * 60_000, pollMs: 2500 }
    );
    silentOrFullUrl = extractVideoUrl(composed);
    if (!silentOrFullUrl) {
      throw new Error("compose returned no video_url");
    }
    notes.push(`silent compose ok (${Math.round(timestamp / 1000)}s picture)`);
  } catch (err) {
    notes.push(
      `compose failed: ${err instanceof Error ? err.message : String(err)}`
    );
    silentOrFullUrl = clipUrls[0];
  }

  let finalUrl = silentOrFullUrl;
  const narrationUrl = options.narrationUrl;

  if (isHttpUrl(narrationUrl) && finalUrl) {
    try {
      onProgress({
        stage: "audio",
        detail: "Adding bedtime story narration…",
      });
      const merged = await falQueueResult(
        MERGE_AV_MODEL,
        {
          video_url: finalUrl,
          audio_url: narrationUrl,
        },
        { timeoutMs: 8 * 60_000 }
      );
      const murl = extractVideoUrl(merged);
      if (!murl) {
        throw new Error("merge-audio-video returned no url");
      }
      finalUrl = murl;
      notes.push("SOUND: bedtime narration merged into MP4");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      notes.push(`SOUND FAILED: ${msg.slice(0, 180)}`);
      // Customer videos should not silently ship mute if narration was expected
      if (quality === "standard" || quality === "premium") {
        throw new Error(
          `Narration merge failed — refusing silent customer video. ${msg.slice(0, 160)}`
        );
      }
    }
  } else if (!narrationUrl) {
    notes.push("SOUND: no narrationUrl provided (silent video)");
  } else if (narrationUrl.startsWith("data:")) {
    notes.push(
      "SOUND FAILED: narration is still a data: URL — must upload to public https first"
    );
    if (quality === "standard" || quality === "premium") {
      throw new Error(
        "Narration audio is not a public URL. Upload ElevenLabs MP3 to storage first."
      );
    }
  } else {
    notes.push(`SOUND FAILED: invalid narration url ${String(narrationUrl).slice(0, 80)}`);
  }

  if (!finalUrl) {
    throw new Error("Movie render produced no URL");
  }

  onProgress({ stage: "done", detail: finalUrl });

  const provider =
    quality === "draft"
      ? "draft-still-hold+ffmpeg"
      : quality === "standard"
        ? "standard-seedance-fast-720p+ffmpeg"
        : "premium-override+ffmpeg";

  return {
    videoUrl: finalUrl,
    clipUrls,
    silentVideoUrl: silentOrFullUrl || undefined,
    pagesUsed: pages.length,
    provider,
    quality,
    notes,
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
