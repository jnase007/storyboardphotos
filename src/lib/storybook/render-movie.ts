/**
 * Storybook movie engine — cost-tiered.
 *
 * Quality tiers:
 * - draft   (DEFAULT): still-hold slideshow via fal ffmpeg images-to-video
 *            pennies, good enough to review pacing + narration + end card
 * - fast    : Seedance 2.0 Fast @ 720p, short clips — mid-cost motion preview
 * - premium : Seedance 2.0 full @ 1080p — $2–3k heirloom final ONLY
 *
 * Pipeline:
 * 1) Page stills → motion clips (tier-dependent)
 * 2) Clip stitch via fal FFmpeg compose
 * 3) Optional bedtime narration merge
 * 4) Optional upload to Supabase public storage
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

export type MovieQuality = "draft" | "fast" | "premium";
export type MoviePackage = "teaser" | "full";

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

/** Motion direction per page — gentle storybook cinema, face-safe. */
export function buildMotionPrompt(
  page: StoryPage,
  childName: string,
  role: "King" | "Queen"
): string {
  const beat = (page.title || page.text || "magical kingdom scene").slice(0, 160);
  return [
    `Premium Disney-quality children's storybook illustration coming gently to life.`,
    `Preserve the exact watercolor painting, soft sepia ink outlines, cream paper texture, and character likeness of ${role} ${childName}.`,
    `Scene: ${beat}.`,
    `Cinematic slow camera push-in with subtle parallax depth.`,
    `Soft magical sparkles and warm fairy light drift through the air.`,
    `Hair, cape, leaves, banners, and candle flames move lightly and naturally.`,
    `Keep face stable and on-model — no morphing, no warping, no identity drift.`,
    `No text, no letters, no subtitles, no watermark, no logo, no UI.`,
    `Wholesome fairytale bedtime energy, rich color, high production value.`,
  ].join(" ");
}

function pageDurationSec(
  page: StoryPage,
  packageKind: MoviePackage,
  quality: MovieQuality
): number {
  const words = (page.text || "").trim().split(/\s+/).filter(Boolean).length;
  // ~130 wpm narration + breathing room
  const fromWords = Math.ceil((words / 130) * 60) + 2;

  if (quality === "draft") {
    const base = packageKind === "teaser" ? 4 : 5;
    return Math.min(8, Math.max(base, Math.min(fromWords, 7)));
  }
  if (quality === "fast") {
    const base = packageKind === "teaser" ? 4 : 5;
    return Math.min(8, Math.max(base, Math.min(fromWords, 7)));
  }
  // premium
  const base = packageKind === "teaser" ? 6 : 8;
  return Math.min(12, Math.max(base, fromWords));
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

  if (quality === "fast") {
    if (packageKind === "teaser" && pages.length > 5) {
      const idxs = [
        0,
        Math.floor(pages.length * 0.3),
        Math.floor(pages.length * 0.55),
        Math.floor(pages.length * 0.8),
        pages.length - 1,
      ];
      const uniq = [...new Set(idxs)].sort((a, b) => a - b);
      pages = uniq.map((i) => pages[i]);
      notes.push(`Fast teaser: ${pages.length} motion beats @ 720p`);
    } else if (pages.length > 8) {
      pages = pages.slice(0, 8);
      notes.push("Fast full capped at 8 animated pages");
    }
    return pages;
  }

  // premium
  if (packageKind === "teaser" && pages.length > 5) {
    const idxs = [
      0,
      Math.floor(pages.length * 0.3),
      Math.floor(pages.length * 0.55),
      Math.floor(pages.length * 0.8),
      pages.length - 1,
    ];
    const uniq = [...new Set(idxs)].sort((a, b) => a - b);
    pages = uniq.map((i) => pages[i]);
    notes.push(`Premium teaser: ${pages.length} hero beats`);
  } else if (pages.length > 10) {
    pages = pages.slice(0, 10);
    notes.push("Premium full capped at 10 animated pages for runtime");
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

  const model = quality === "fast" ? SEEDANCE_FAST : SEEDANCE_PREMIUM;
  const prompt = buildMotionPrompt(page, childName, role);
  const resolution = quality === "fast" ? "720p" : "1080p";

  try {
    const input: Record<string, unknown> = {
      prompt,
      image_url: page.imageUrl,
      resolution,
      duration: String(Math.min(12, Math.max(4, duration))),
      aspect_ratio: "16:9",
      generate_audio: false,
      bitrate_mode: quality === "premium" ? "high" : "standard",
    };

    const result = await falQueueResult(model, input, {
      timeoutMs: quality === "premium" ? 15 * 60_000 : 10 * 60_000,
      pollMs: 3000,
    });
    const url = extractVideoUrl(result);
    if (!url) throw new Error(`No video url for page ${index + 1}`);
    notes.push(
      `clip ${index + 1}: ${quality === "fast" ? "Seedance Fast" : "Seedance"} ok (${duration}s ${resolution})`
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
  const quality: MovieQuality = options.quality ?? "draft";
  const notes: string[] = [
    `quality=${quality}`,
    `package=${packageKind}`,
    quality === "draft"
      ? "COST MODE: still-hold draft (cheap). Not Seedance."
      : quality === "fast"
        ? "COST MODE: Seedance Fast 720p mid-tier."
        : "COST MODE: Seedance 2.0 1080p PREMIUM — expensive final only.",
  ];

  let pages = stripRedundantTitlePages(options.pages || []).filter((p) =>
    isHttpUrl(p.imageUrl)
  );

  if (!pages.length) {
    throw new Error("No page images available to animate");
  }

  pages = selectPages(pages, packageKind, quality, notes);

  const onProgress = options.onProgress ?? (() => undefined);
  const motionLabel =
    quality === "draft"
      ? "still-hold draft"
      : quality === "fast"
        ? "Seedance Fast"
        : "Seedance premium";

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

  let timestamp = 0;
  const videoKeyframes = clipUrls.map((url, i) => {
    const duration = clipDurationsMs[i] ?? 8000;
    const kf = { timestamp, duration, url };
    timestamp += duration;
    return kf;
  });

  const tracks: Array<{
    id: string;
    type: string;
    keyframes: Array<{ timestamp: number; duration: number; url: string }>;
  }> = [
    {
      id: "video",
      type: "video",
      keyframes: videoKeyframes,
    },
  ];

  if (isHttpUrl(options.narrationUrl)) {
    tracks.push({
      id: "narration",
      type: "audio",
      keyframes: [
        {
          timestamp: 0,
          duration: timestamp,
          url: options.narrationUrl,
        },
      ],
    });
    notes.push("Narration track included in compose");
  }

  let silentOrFullUrl: string | null = null;
  try {
    const composed = await falQueueResult(
      COMPOSE_MODEL,
      { tracks },
      { timeoutMs: 10 * 60_000, pollMs: 2500 }
    );
    silentOrFullUrl = extractVideoUrl(composed);
    if (!silentOrFullUrl) {
      throw new Error("compose returned no video_url");
    }
  } catch (err) {
    notes.push(
      `compose failed: ${err instanceof Error ? err.message : String(err)}`
    );
    silentOrFullUrl = clipUrls[0];
  }

  let finalUrl = silentOrFullUrl;

  if (
    isHttpUrl(options.narrationUrl) &&
    finalUrl &&
    !notes.some((n) => n.includes("Narration track included"))
  ) {
    try {
      onProgress({ stage: "audio", detail: "Merging bedtime narration" });
      const merged = await falQueueResult(
        MERGE_AV_MODEL,
        {
          video_url: finalUrl,
          audio_url: options.narrationUrl,
        },
        { timeoutMs: 8 * 60_000 }
      );
      const murl = extractVideoUrl(merged);
      if (murl) {
        finalUrl = murl;
        notes.push("Narration merged via merge-audio-video");
      }
    } catch (err) {
      notes.push(
        `audio merge skipped: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (!finalUrl) {
    throw new Error("Movie render produced no URL");
  }

  onProgress({ stage: "done", detail: finalUrl });

  const provider =
    quality === "draft"
      ? "draft-still-hold+ffmpeg"
      : quality === "fast"
        ? "seedance-fast-720p+ffmpeg"
        : "seedance-2.0-1080p+ffmpeg";

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
