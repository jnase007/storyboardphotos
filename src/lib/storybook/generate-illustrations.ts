import type { KingdomSet, PhotosBySet, StoryPage } from "./types";
import { SET_UPLOAD_SLOTS } from "./types";

type FluxResult = {
  imageUrl: string;
  provider: "fal" | "placeholder";
};

const STYLE_SUFFIX =
  "double-page spread children's storybook watercolor illustration, hand-drawn fine ink outlines, soft watercolor washes with gentle pastel colors, detailed enchanted kingdom scene with castle towers stone paths wildflowers fairies, decorative vine border frame around the edges, warm cream background, rich detailed scenery like a premium illustrated children's book, whimsical and magical atmosphere, style of a classic fairy tale picture book, lush green trees and rolling hills, cozy storybook feel, no text no watermark";

/**
 * Remove background from an image using fal-ai/bria background removal.
 * Returns the transparent PNG URL, or falls back to the original URL on failure.
 */
async function removeBackground(imageUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;
  if (!falKey) return imageUrl;
  try {
    const res = await fetch("https://fal.run/fal-ai/bria/background/remove", {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    if (res.ok) {
      const data = await res.json();
      const url = data?.image?.url ?? data?.images?.[0]?.url;
      if (typeof url === "string") return url;
    } else {
      console.warn("bria background removal failed:", await res.text());
    }
  } catch (err) {
    console.warn("bria background removal error:", err);
  }
  return imageUrl;
}

/**
 * Upload a base64 data URL to fal.ai storage and return a public URL.
 * Required before passing character photo to background removal.
 */
async function uploadBase64ToFal(dataUrl: string): Promise<string | null> {
  const falKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;
  if (!falKey) return null;
  try {
    // Extract mime type and base64 data
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    const [, mimeType, base64Data] = match;
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    const res = await fetch("https://fal.run/fal-ai/storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": mimeType,
      },
      body: blob,
    });
    if (res.ok) {
      const data = await res.json();
      return data?.url ?? null;
    }
  } catch (err) {
    console.warn("fal storage upload failed:", err);
  }
  return null;
}

/**
 * Generate a watercolor storybook illustration via fal.ai flux-pulid
 * when a character photo is provided (preserves face/likeness).
 */
async function generateWithPulid(options: {
  prompt: string;
  characterPhotoUrl: string;
}): Promise<FluxResult> {
  const falKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;
  if (!falKey) {
    return fallbackPlaceholder(options.prompt);
  }

  try {
    const res = await fetch("https://fal.run/fal-ai/flux-pulid", {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${options.prompt}. ${STYLE_SUFFIX}. The child in the scene should look exactly like the reference photo — same face, features, and likeness.`,
        reference_images: [
          {
            image_url: options.characterPhotoUrl,
          },
        ],
        num_inference_steps: 30,
        guidance_scale: 4.5,
        image_size: "portrait_4_3",
        enable_safety_checker: true,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const url =
        data?.images?.[0]?.url ??
        data?.image?.url ??
        (Array.isArray(data?.output) ? data.output[0] : null);
      if (typeof url === "string") {
        return { imageUrl: url, provider: "fal" };
      }
    } else {
      console.error("flux-pulid error:", await res.text());
    }
  } catch (err) {
    console.error("flux-pulid failed:", err);
  }

  return fallbackPlaceholder(options.prompt);
}

/**
 * Generate a watercolor storybook illustration via Google Imagen 4.0.
 * Higher quality than Flux Dev — used as the primary generator when no character photo.
 */
async function generateWithImagen4(prompt: string): Promise<FluxResult> {
  const googleKey = process.env.GOOGLE_AI_API_KEY;
  if (!googleKey) return fallbackPlaceholder(prompt);

  const STYLE =
    "double-page spread children's storybook watercolor illustration, hand-drawn fine ink outlines, soft watercolor washes with gentle pastel colors, detailed enchanted kingdom scene with castle towers stone paths wildflowers fairies, decorative vine border frame around the edges, warm cream background, rich detailed scenery like a premium illustrated children's book, whimsical and magical atmosphere, style of a classic fairy tale picture book, lush green trees and rolling hills, cozy storybook feel, no text, no watermark";

  const fullPrompt = `${prompt}. ${STYLE}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${googleKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: fullPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "3:4",
            safetyFilterLevel: "block_few",
            personGeneration: "allow_adult",
          },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        // Return as data URL — jsPDF can handle it directly
        const dataUrl = `data:image/jpeg;base64,${b64}`;
        return { imageUrl: dataUrl, provider: "fal" };
      }
    } else {
      console.error("Imagen 4.0 error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Imagen 4.0 failed:", err);
  }

  return fallbackPlaceholder(prompt);
}

function fallbackPlaceholder(prompt: string): FluxResult {
  const label = encodeURIComponent(
    prompt.slice(0, 60).replace(/\s+/g, " ")
  );
  return {
    imageUrl: `https://placehold.co/768x1024/1E3352/D4B07A/png?text=${label}&font=playfair-display`,
    provider: "placeholder",
  };
}

/**
 * Generate a watercolor storybook illustration.
 *
 * Priority order:
 * 1. characterPhotoUrl provided → flux-pulid (face/likeness preservation)
 * 2. No character photo → Google Imagen 4.0 (primary, best quality)
 * 3. Imagen 4.0 fails or no key → Fal.ai Flux Dev
 * 4. Last resort → placeholder
 */
export async function generateStoryIllustration(options: {
  prompt: string;
  referenceImageUrl?: string | null;
  characterPhotoUrl?: string | null;
}): Promise<FluxResult> {
  const falKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;

  // 1. If a processed character photo URL is provided, use flux-pulid for likeness preservation
  if (options.characterPhotoUrl) {
    return generateWithPulid({
      prompt: options.prompt,
      characterPhotoUrl: options.characterPhotoUrl,
    });
  }

  // 2. Try Google Imagen 4.0 first (primary generator — best quality)
  const googleKey = process.env.GOOGLE_AI_API_KEY;
  if (googleKey) {
    const result = await generateWithImagen4(options.prompt);
    if (result.provider !== "placeholder") {
      return result;
    }
  }

  // 3. Fallback to Fal.ai Flux Dev
  if (falKey) {
    const withRef =
      Boolean(options.referenceImageUrl) &&
      !options.referenceImageUrl!.startsWith("data:");
    const endpoint = withRef
      ? "https://fal.run/fal-ai/flux/dev/image-to-image"
      : "https://fal.run/fal-ai/flux/dev";

    const body = withRef
      ? {
          prompt: `${options.prompt}. ${STYLE_SUFFIX}. Preserve the child's face and likeness from the reference photo.`,
          image_url: options.referenceImageUrl,
          strength: 0.72,
          num_inference_steps: 32,
          guidance_scale: 4.0,
          image_size: "portrait_4_3",
          enable_safety_checker: true,
        }
      : {
          prompt: `${options.prompt}. ${STYLE_SUFFIX}.`,
          num_inference_steps: 32,
          guidance_scale: 4.0,
          image_size: "portrait_4_3",
          enable_safety_checker: true,
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const url =
          data?.images?.[0]?.url ??
          data?.image?.url ??
          (Array.isArray(data?.output) ? data.output[0] : null);
        if (typeof url === "string") {
          return { imageUrl: url, provider: "fal" };
        }
      } else {
        console.error("fal.ai Flux error:", await res.text());
      }
    } catch (err) {
      console.error("fal.ai Flux failed:", err);
    }
  }

  // 4. Last resort — placeholder
  return fallbackPlaceholder(options.prompt);
}

const SET_NAME_TO_ID: Record<Exclude<KingdomSet, null>, keyof PhotosBySet> = {
  "Throne Room": "throne-room",
  "Royal Forest": "royal-forest",
  "Royal Garden": "royal-garden",
  "Chastle": "chastle",
};

/** Flatten photos_by_set into a single list (order: throne → forest → garden → quest). */
export function flattenPhotosBySet(photosBySet: PhotosBySet): string[] {
  return SET_UPLOAD_SLOTS.flatMap((slot) => photosBySet[slot.id] ?? []);
}

/**
 * Fill page images using per-set session photos when available.
 * When characterPhoto is provided, AI illustration pages use flux-pulid for likeness preservation.
 * When no character photo, Google Imagen 4.0 is used for primary generation.
 */
export async function illustrateStoryPages(options: {
  pages: StoryPage[];
  photoUrls?: string[];
  photosBySet?: PhotosBySet;
  /** Optional character portrait (base64 data URL or public URL) */
  characterPhoto?: string | null;
}): Promise<StoryPage[]> {
  const { pages, photosBySet, characterPhoto } = options;
  const flat =
    options.photoUrls ??
    (photosBySet ? flattenPhotosBySet(photosBySet) : []);
  const reference = flat.find((u) => !u.startsWith("data:")) ?? null;

  // Process character photo: upload if base64, then remove background
  let processedCharacterPhotoUrl: string | null = null;
  if (characterPhoto) {
    let photoUrl = characterPhoto;
    if (characterPhoto.startsWith("data:")) {
      const uploaded = await uploadBase64ToFal(characterPhoto);
      if (uploaded) photoUrl = uploaded;
      else {
        // Can't upload — skip character photo compositing
        photoUrl = "";
      }
    }
    if (photoUrl) {
      processedCharacterPhotoUrl = await removeBackground(photoUrl);
    }
  }

  // Round-robin cursor per set so multiple photos on one set rotate
  const setCursors: Partial<Record<keyof PhotosBySet, number>> = {};
  let flatCursor = 0;
  const result: StoryPage[] = [];

  for (const page of pages) {
    if (page.photoSet && photosBySet) {
      const setId = SET_NAME_TO_ID[page.photoSet];
      const pool = photosBySet[setId] ?? [];
      if (pool.length > 0) {
        const idx = setCursors[setId] ?? 0;
        setCursors[setId] = idx + 1;
        result.push({ ...page, imageUrl: pool[idx % pool.length] });
        continue;
      }
    }

    const preferPhoto = page.useSessionPhoto || Boolean(page.photoSet);
    if (preferPhoto && flat.length > 0) {
      const photo = flat[flatCursor % flat.length];
      flatCursor += 1;
      result.push({ ...page, imageUrl: photo });
      continue;
    }

    if (page.imageUrl) {
      result.push(page);
      continue;
    }

    // AI illustration page — use flux-pulid if character photo provided,
    // otherwise Imagen 4.0 (primary) → Flux Dev (fallback)
    const art = await generateStoryIllustration({
      prompt: page.imagePrompt ?? page.title,
      referenceImageUrl: reference,
      characterPhotoUrl: processedCharacterPhotoUrl,
    });

    result.push({ ...page, imageUrl: art.imageUrl });
  }

  return result;
}
