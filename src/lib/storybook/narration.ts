import type { StoryPage } from "./types";

export type NarrationClip = {
  page: number;
  text: string;
  audioUrl: string | null;
  durationHintSec?: number;
};

/**
 * Disney-tier bedtime narration from book pages.
 * Name already filled — no pronouns. Warm, slow, storybook cadence.
 */
export function buildNarrationScript(
  childName: string,
  role: "King" | "Queen",
  pages: StoryPage[]
): string {
  const lines: string[] = [
    `Once upon a time, in the Kingdom of Light, there lived ${role} ${childName}.`,
    "",
  ];

  for (const page of pages) {
    const body = (page.text || "").trim();
    if (!body) continue;
    if (body === page.title) continue;

    // Soft page beats help ElevenLabs pace like a real reader
    if (page.title && page.title !== body.slice(0, page.title.length)) {
      lines.push(page.title + ".");
    }
    lines.push(body);
    lines.push("");
  }

  lines.push(
    `And so, ${role} ${childName} lived bravely ever after — knowing ${childName} is strong, kind, and deeply loved.`,
    "The End.",
    `Sweet dreams, ${role} ${childName}.`
  );

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Per-page clips for syncing with page turns / video. */
export function buildPageNarrationTexts(pages: StoryPage[]): Array<{
  page: number;
  text: string;
}> {
  return pages
    .map((p) => ({
      page: p.page,
      text: (p.text || "").trim(),
    }))
    .filter((p) => p.text.length > 0);
}

function falKey(): string | null {
  return (
    process.env.FAL_KEY?.trim() ||
    process.env.FAL_API_KEY?.trim() ||
    null
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** fal queue helper for MiniMax TTS fallback */
async function falQueueJson(
  model: string,
  input: Record<string, unknown>,
  timeoutMs = 3 * 60_000
): Promise<Record<string, unknown>> {
  const key = falKey();
  if (!key) throw new Error("FAL_KEY not set");
  const queue = "https://queue.fal.run";
  const submit = await fetch(`${queue}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!submit.ok) {
    throw new Error(`fal ${model} submit ${submit.status}: ${(await submit.text()).slice(0, 200)}`);
  }
  const submitted = (await submit.json()) as {
    request_id?: string;
    status_url?: string;
    response_url?: string;
    audio?: { url?: string };
  };
  if (submitted.audio?.url) return submitted as Record<string, unknown>;
  const requestId = submitted.request_id;
  if (!requestId) throw new Error(`fal ${model}: missing request_id`);
  const statusUrl =
    submitted.status_url || `${queue}/${model}/requests/${requestId}/status`;
  const resultUrl =
    submitted.response_url || `${queue}/${model}/requests/${requestId}`;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const st = await fetch(statusUrl, {
      headers: { Authorization: `Key ${key}` },
    });
    if (!st.ok) {
      await sleep(1500);
      continue;
    }
    const status = (await st.json()) as { status?: string };
    if (status.status === "COMPLETED") {
      const res = await fetch(resultUrl, {
        headers: { Authorization: `Key ${key}` },
      });
      if (!res.ok) {
        throw new Error(`fal ${model} result ${res.status}`);
      }
      return (await res.json()) as Record<string, unknown>;
    }
    if (status.status === "FAILED" || status.status === "ERROR") {
      throw new Error(`fal ${model} failed`);
    }
    await sleep(1500);
  }
  throw new Error(`fal ${model} timed out`);
}

async function generateWithElevenLabs(text: string): Promise<{
  audioUrl: string | null;
  provider: string;
  error?: string;
  bytes?: number;
}> {
  const apiKey = (process.env.ELEVENLABS_API_KEY || "").trim();
  const voiceId = (
    process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb"
  ).trim();
  if (!apiKey) {
    return {
      audioUrl: null,
      provider: "elevenlabs",
      error: "ELEVENLABS_API_KEY not set",
    };
  }
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.72,
          similarity_boost: 0.8,
          style: 0.28,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      audioUrl: null,
      provider: "elevenlabs",
      error: `ElevenLabs ${res.status}: ${errText.slice(0, 160)}`,
    };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength < 1000) {
    return {
      audioUrl: null,
      provider: "elevenlabs",
      error: `ElevenLabs tiny audio (${buf.byteLength}b)`,
    };
  }
  return {
    audioUrl: `data:audio/mpeg;base64,${buf.toString("base64")}`,
    provider: "elevenlabs",
    bytes: buf.byteLength,
  };
}

/** Reliable bedtime TTS via fal MiniMax (works when ElevenLabs key lacks TTS). */
async function generateWithFalMinimax(text: string): Promise<{
  audioUrl: string | null;
  provider: string;
  error?: string;
  bytes?: number;
}> {
  if (!falKey()) {
    return { audioUrl: null, provider: "fal-minimax", error: "FAL_KEY not set" };
  }
  // MiniMax handles long-ish scripts; keep headroom
  const clipped = text.slice(0, 2500);
  const model =
    process.env.FAL_TTS_MODEL || "fal-ai/minimax/speech-02-hd";
  const voiceId = process.env.FAL_TTS_VOICE || "Wise_Woman";
  try {
    const result = await falQueueJson(model, {
      text: clipped,
      voice_setting: {
        voice_id: voiceId,
        speed: 0.92,
        vol: 1,
        pitch: 0,
      },
    });
    const url =
      (result as { audio?: { url?: string; file_size?: number } }).audio?.url ||
      (result as { audio_url?: string }).audio_url;
    if (!url || !/^https?:\/\//i.test(url)) {
      return {
        audioUrl: null,
        provider: "fal-minimax",
        error: "fal TTS returned no audio url",
      };
    }
    const size =
      (result as { audio?: { file_size?: number } }).audio?.file_size ||
      undefined;
    return {
      audioUrl: url,
      provider: "fal-minimax",
      bytes: size,
    };
  } catch (err) {
    return {
      audioUrl: null,
      provider: "fal-minimax",
      error: err instanceof Error ? err.message : "fal TTS failed",
    };
  }
}

/**
 * Bedtime story narration.
 * 1) ElevenLabs if key has TTS permission
 * 2) fal MiniMax Speech HD fallback (verified working)
 */
export async function generateNarrationAudio(options: {
  text: string;
  filename?: string;
}): Promise<{ audioUrl: string | null; provider: string; error?: string; bytes?: number }> {
  const text = options.text.replace(/\s+/g, " ").trim().slice(0, 4500);
  if (text.length < 20) {
    return {
      audioUrl: null,
      provider: "none",
      error: "Narration script too short",
    };
  }

  // Prefer ElevenLabs when permitted
  const eleven = await generateWithElevenLabs(text).catch((err) => ({
    audioUrl: null as string | null,
    provider: "elevenlabs",
    error: err instanceof Error ? err.message : "ElevenLabs failed",
  }));
  if (eleven.audioUrl) return eleven;

  console.warn("ElevenLabs unavailable, falling back to fal MiniMax:", eleven.error);
  const fal = await generateWithFalMinimax(text);
  if (fal.audioUrl) return fal;

  return {
    audioUrl: null,
    provider: "none",
    error: `Narration failed. ElevenLabs: ${eleven.error || "n/a"}; fal: ${fal.error || "n/a"}`,
  };
}

/** Motion prompt for Seedance — soft classic storybook adventure film (shared engine) */
export const SEEDANCE_PAGE_MOTION_PROMPT =
  "Soft classic storybook adventure film motion (Winnie-the-Pooh warmth, picture-book cinema), whimsical watercolor children's page gently coming to life, soft sepia ink outlines stay stable, pastel watercolor washes preserved, soft 2D parallax, hair and cape drift lightly, magical sparkles twinkle, slow elegant camera push-in, warm golden fairy light, calm readable pacing, NOT anime, NOT 3D CGI, no morphing face, no photorealism, no text, no watermark";
