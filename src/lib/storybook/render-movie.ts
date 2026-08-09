/**
 * Premium animated storybook movie engine.
 * Target: $2–3k gift-quality mini-movie parents can download as MP4.
 *
 * Pipeline:
 * 1) Page stills → Seedance 2.0 image-to-video (cinematic motion, no fake speech)
 * 2) Clip stitch via fal FFmpeg compose
 * 3) Bedtime narration (ElevenLabs URL) merged as audio track
 * 4) Optional upload to Supabase public storage
 */

import type { StoryPage } from "./types";
import { stripRedundantTitlePages } from "./adventure-paths";

const FAL_QUEUE = "https://queue.fal.run";
const SEEDANCE_MODEL = "bytedance/seedance-2.0/image-to-video";
const COMPOSE_MODEL = "fal-ai/ffmpeg-api/compose";
const MERGE_AV_MODEL = "fal-ai/ffmpeg-api/merge-audio-video";

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
    // Some endpoints return the result inline
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

function pageDurationSec(page: StoryPage, packageKind: "teaser" | "full"): number {
  const words = (page.text || "").trim().split(/\s+/).filter(Boolean).length;
  // ~130 wpm narration + breathing room for cinematic holds
  const fromWords = Math.ceil((words / 130) * 60) + 2;
  const base = packageKind === "teaser" ? 6 : 8;
  return Math.min(12, Math.max(base, fromWords));
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
  notes: string[];
};

/**
 * Render a downloadable MP4 from storybook pages.
 * Uses Seedance 2.0 per page + FFmpeg stitch + optional narration merge.
 */
export async function renderPremiumStoryMovie(options: {
  childName: string;
  gender: string;
  pages: StoryPage[];
  narrationUrl?: string | null;
  package?: "teaser" | "full";
  coverImageUrl?: string | null;
  onProgress?: (p: RenderMovieProgress) => void;
}): Promise<RenderMovieResult> {
  const key = falKey();
  if (!key) {
    throw new Error("FAL_KEY / FAL_API_KEY required for premium movie render");
  }

  const role = options.gender === "girl" ? "Queen" : "King";
  const packageKind = options.package ?? "full";
  const notes: string[] = [];

  let pages = stripRedundantTitlePages(options.pages || []).filter((p) =>
    isHttpUrl(p.imageUrl)
  );

  if (!pages.length) {
    throw new Error("No page images available to animate");
  }

  // Teaser = first + middle + climax + ending (max 5)
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
    notes.push(`Teaser package: ${pages.length} hero beats`);
  }

  // Soft cap full movie cost/time (still premium length)
  if (packageKind === "full" && pages.length > 10) {
    pages = pages.slice(0, 10);
    notes.push("Full package capped at 10 animated pages for runtime");
  }

  const onProgress = options.onProgress ?? (() => undefined);
  onProgress({
    stage: "animating",
    detail: `Seedance motion on ${pages.length} pages`,
    clipsDone: 0,
    clipsTotal: pages.length,
  });

  const clipUrls: string[] = [];
  const clipDurationsMs: number[] = [];

  // Animate pages sequentially for stability (Seedance is heavy)
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const duration = pageDurationSec(page, packageKind);
    const prompt = buildMotionPrompt(page, options.childName, role);

    onProgress({
      stage: "animating",
      detail: `Page ${i + 1}/${pages.length}: ${page.title || "scene"}`,
      clipsDone: i,
      clipsTotal: pages.length,
    });

    try {
      const result = await falQueueResult(
        SEEDANCE_MODEL,
        {
          prompt,
          image_url: page.imageUrl,
          resolution: "1080p",
          duration: String(Math.min(12, Math.max(5, duration))),
          aspect_ratio: "16:9",
          // Narration is separate ElevenLabs track — avoid model speech
          generate_audio: false,
          bitrate_mode: "high",
        },
        { timeoutMs: 15 * 60_000, pollMs: 3000 }
      );

      const url =
        (result as { video?: { url?: string } }).video?.url ||
        (result as { video_url?: string }).video_url;

      if (!url || typeof url !== "string") {
        throw new Error(`No video url for page ${i + 1}`);
      }
      clipUrls.push(url);
      clipDurationsMs.push(duration * 1000);
      notes.push(`clip ${i + 1}: Seedance ok (${duration}s)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      notes.push(`clip ${i + 1} Seedance failed → still hold: ${msg.slice(0, 120)}`);
      // Fallback: hold still as single-frame clip via images-to-video
      try {
        const still = await falQueueResult(
          "fal-ai/ffmpeg-api/images-to-video",
          {
            fps: 24,
            images: [
              {
                url: page.imageUrl,
                frames: Math.round(duration * 24),
              },
            ],
          },
          { timeoutMs: 5 * 60_000 }
        );
        const stillUrl =
          (still as { video?: { url?: string } }).video?.url ||
          (still as { video_url?: string }).video_url;
        if (!stillUrl) throw new Error("still fallback missing url");
        clipUrls.push(stillUrl);
        clipDurationsMs.push(duration * 1000);
      } catch (e2) {
        notes.push(
          `clip ${i + 1} dropped: ${e2 instanceof Error ? e2.message : String(e2)}`
        );
      }
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

  onProgress({ stage: "stitching", detail: `Composing ${clipUrls.length} clips` });

  // Compose video track from clips (sequential keyframes)
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

  // If narration exists, lay it under the full timeline
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
    silentOrFullUrl =
      (composed as { video_url?: string }).video_url ||
      (composed as { video?: { url?: string } }).video?.url ||
      null;
    if (!silentOrFullUrl) {
      throw new Error("compose returned no video_url");
    }
  } catch (err) {
    notes.push(
      `compose failed: ${err instanceof Error ? err.message : String(err)}`
    );
    // Fallback: return first clip if compose fails
    silentOrFullUrl = clipUrls[0];
  }

  let finalUrl = silentOrFullUrl;

  // If compose didn't take audio (or audio failed), try explicit merge
  if (
    isHttpUrl(options.narrationUrl) &&
    finalUrl &&
    !notes.some((n) => n.includes("Narration track included") && !n.includes("failed"))
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
      const murl =
        (merged as { video?: { url?: string } }).video?.url ||
        (merged as { video_url?: string }).video_url;
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

  return {
    videoUrl: finalUrl,
    clipUrls,
    silentVideoUrl: silentOrFullUrl || undefined,
    pagesUsed: pages.length,
    provider: "seedance-2.0+ffmpeg",
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
