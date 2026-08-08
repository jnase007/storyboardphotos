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

/**
 * ElevenLabs bedtime storyteller voice.
 * Tuned for warm, slow, Disney-parent read-aloud energy.
 */
export async function generateNarrationAudio(options: {
  text: string;
  filename?: string;
}): Promise<{ audioUrl: string | null; provider: string; error?: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId =
    process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";

  if (!apiKey) {
    return {
      audioUrl: null,
      provider: "none",
      error: "ELEVENLABS_API_KEY not set",
    };
  }

  // Keep under model limits — long books still need headroom
  const text = options.text.slice(0, 5000);

  try {
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
          model_id:
            process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
          voice_settings: {
            // Higher stability = smoother bedtime read; moderate style = gentle warmth
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
      console.error("ElevenLabs error:", res.status, errText);
      return {
        audioUrl: null,
        provider: "elevenlabs",
        error: `ElevenLabs ${res.status}`,
      };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const base64 = buf.toString("base64");
    return {
      audioUrl: `data:audio/mpeg;base64,${base64}`,
      provider: "elevenlabs",
    };
  } catch (err) {
    console.error("ElevenLabs failed:", err);
    return {
      audioUrl: null,
      provider: "elevenlabs",
      error: err instanceof Error ? err.message : "Narration failed",
    };
  }
}

/** Motion prompt for Seedance / Higgsfield — keep pages looking like coloring art while alive */
export const SEEDANCE_PAGE_MOTION_PROMPT =
  "Premium Disney-quality children's coloring book page gently coming to life, ultra-clean black ink outlines stay sharp and stable, cream parchment texture preserved, soft 2D parallax, hair and cape drift lightly, magical sparkle outlines twinkle, slow elegant camera push-in, warm golden fairy light, no morphing face, no photorealism, no text, no watermark";
