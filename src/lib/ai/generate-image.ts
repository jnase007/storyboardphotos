import { AI_STYLE_PRESETS } from "../constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

export type AIProvider = "google" | "replicate" | "together";

interface GenerateImageOptions {
  prompt: string;
  stylePreset: string;
}

interface GenerateImageResult {
  imageUrl: string;
  provider: AIProvider;
}

/**
 * Builds the full prompt with style preset suffix and quality modifiers.
 */
export function buildFullPrompt(prompt: string, stylePreset: string): string {
  const preset = AI_STYLE_PRESETS.find((p) => p.id === stylePreset);
  const suffix = preset?.promptSuffix ?? "";
  return `A premium portrait of ${prompt} ${suffix}. Professional photography, cinematic lighting, warm golden tones, dignified and joyful expression, photorealistic, 8k quality, no text, no watermark.`;
}

/**
 * Generate image via Google Imagen (Vertex AI / Gemini API).
 * Requires GOOGLE_AI_API_KEY environment variable.
 */
async function generateWithGoogle(
  fullPrompt: string
): Promise<GenerateImageResult | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: fullPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_medium_and_above",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Google Imagen error:", await response.text());
      return null;
    }

    const data = await response.json();
    const base64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!base64) return null;

    return {
      imageUrl: `data:image/png;base64,${base64}`,
      provider: "google",
    };
  } catch (error) {
    console.error("Google Imagen failed:", error);
    return null;
  }
}

/**
 * Generate image via Replicate (Flux.1 fallback).
 * Requires REPLICATE_API_TOKEN environment variable.
 */
async function generateWithReplicate(
  fullPrompt: string
): Promise<GenerateImageResult | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  try {
    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          input: {
            prompt: fullPrompt,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 90,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Replicate error:", await response.text());
      return null;
    }

    const data = await response.json();
    const output = data.output;
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl || typeof imageUrl !== "string") return null;

    return { imageUrl, provider: "replicate" };
  } catch (error) {
    console.error("Replicate failed:", error);
    return null;
  }
}

/**
 * Generate image via Together.ai (Flux fallback).
 * Requires TOGETHER_API_KEY environment variable.
 */
async function generateWithTogether(
  fullPrompt: string
): Promise<GenerateImageResult | null> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      "https://api.together.xyz/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "black-forest-labs/FLUX.1-schnell",
          prompt: fullPrompt,
          width: 1024,
          height: 1024,
          steps: 4,
          n: 1,
        }),
      }
    );

    if (!response.ok) {
      console.error("Together.ai error:", await response.text());
      return null;
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) return null;

    return { imageUrl, provider: "together" };
  } catch (error) {
    console.error("Together.ai failed:", error);
    return null;
  }
}

/**
 * Demo placeholder when no AI API keys are configured.
 */
function generatePlaceholder(prompt: string): GenerateImageResult {
  const encoded = encodeURIComponent(prompt.slice(0, 80));
  return {
    imageUrl: `https://placehold.co/1024x1024/0A1628/C5A26F/png?text=${encoded}&font=playfair-display`,
    provider: "google",
  };
}

/**
 * Main image generation with provider fallback chain:
 * Google Imagen → Replicate Flux → Together Flux → Placeholder
 */
export async function generateKingdomImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const fullPrompt = buildFullPrompt(options.prompt, options.stylePreset);

  const googleResult = await generateWithGoogle(fullPrompt);
  if (googleResult) return googleResult;

  const replicateResult = await generateWithReplicate(fullPrompt);
  if (replicateResult) return replicateResult;

  const togetherResult = await generateWithTogether(fullPrompt);
  if (togetherResult) return togetherResult;

  console.warn(
    "No AI provider configured — returning placeholder. Set GOOGLE_AI_API_KEY, REPLICATE_API_TOKEN, or TOGETHER_API_KEY."
  );
  return generatePlaceholder(options.prompt);
}

/**
 * Upload generated image to Supabase Storage.
 */
export async function uploadToStorage(
  supabase: SupabaseClient<Database>,
  imageUrl: string,
  filename: string
): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    let buffer: Buffer;
    let contentType = "image/webp";

    if (imageUrl.startsWith("data:")) {
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;
      contentType = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = response.headers.get("content-type") ?? "image/webp";
    }

    const storagePath = `previews/${filename}`;
    const { error } = await supabase.storage
      .from("generated-images")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("generated-images").getPublicUrl(storagePath);

    return { publicUrl, storagePath };
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
}
