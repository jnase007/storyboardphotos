import type { KingdomSet, PhotosBySet, StoryPage } from "./types";
import { SET_UPLOAD_SLOTS } from "./types";

type FluxResult = {
  imageUrl: string;
  provider: "fal" | "placeholder";
};

/**
 * Generate a watercolor storybook illustration via fal.ai Flux
 * (with optional reference image for character consistency).
 */
export async function generateStoryIllustration(options: {
  prompt: string;
  referenceImageUrl?: string | null;
}): Promise<FluxResult> {
  const falKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;

  if (falKey) {
    const withRef =
      Boolean(options.referenceImageUrl) &&
      !options.referenceImageUrl!.startsWith("data:");
    const endpoint = withRef
      ? "https://fal.run/fal-ai/flux/dev/image-to-image"
      : "https://fal.run/fal-ai/flux/dev";

    const STYLE_SUFFIX = "classic children's storybook watercolor illustration, soft fine ink outlines, gentle pastel washes on cream white background, delicate floral details, rosy cheeks, warm soft lighting, intricate costume details with floral embroidery, whimsical and enchanting, style of a premium children's picture book, no text, no watermark, no borders, isolated figure on cream background";

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

  const label = encodeURIComponent(
    options.prompt.slice(0, 60).replace(/\s+/g, " ")
  );
  return {
    imageUrl: `https://placehold.co/768x1024/1E3352/D4B07A/png?text=${label}&font=playfair-display`,
    provider: "placeholder",
  };
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
 */
export async function illustrateStoryPages(options: {
  pages: StoryPage[];
  photoUrls?: string[];
  photosBySet?: PhotosBySet;
}): Promise<StoryPage[]> {
  const { pages, photosBySet } = options;
  const flat =
    options.photoUrls ??
    (photosBySet ? flattenPhotosBySet(photosBySet) : []);
  const reference = flat.find((u) => !u.startsWith("data:")) ?? null;

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

    const art = await generateStoryIllustration({
      prompt: page.imagePrompt ?? page.title,
      referenceImageUrl: reference,
    });

    result.push({ ...page, imageUrl: art.imageUrl });
  }

  return result;
}
