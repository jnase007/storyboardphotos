import type { KingdomSet, PhotosBySet, StoryPage } from "./types";
import { SET_UPLOAD_SLOTS } from "./types";


/** Pre-approved watercolor scene illustrations — used instead of generating new AI images */
export const STATIC_SCENES: Record<string, string> = {
  "dragon-slayer/title": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/dragon-slayer/title.jpg",
  "dragon-slayer/call": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/dragon-slayer/call.jpg",
  "dragon-slayer/dragon": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/dragon-slayer/dragon.jpg",
  "dragon-slayer/victory": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/dragon-slayer/victory.jpg",
  "dragon-slayer/end": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/dragon-slayer/end.jpg",
  "rescue-mission/title": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/rescue-mission/title.jpg",
  "rescue-mission/call": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/rescue-mission/call.jpg",
  "rescue-mission/search": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/rescue-mission/search.jpg",
  "rescue-mission/found": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/rescue-mission/found.jpg",
  "rescue-mission/end": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/rescue-mission/end.jpg",
  "lost-crown/title": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/lost-crown/title.jpg",
  "lost-crown/call": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/lost-crown/call.jpg",
  "lost-crown/clues": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/lost-crown/clues.jpg",
  "lost-crown/discovery": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/lost-crown/discovery.jpg",
  "lost-crown/end": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/lost-crown/end.jpg",
  "forest-guardian/title": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/forest-guardian/title.jpg",
  "forest-guardian/call": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/forest-guardian/call.jpg",
  "forest-guardian/journey": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/forest-guardian/journey.jpg",
  "forest-guardian/magic": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/forest-guardian/magic.jpg",
  "forest-guardian/end": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/forest-guardian/end.jpg",
  "kindness-quest/title": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kindness-quest/title.jpg",
  "kindness-quest/call": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kindness-quest/call.jpg",
  "kindness-quest/journey": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kindness-quest/journey.jpg",
  "kindness-quest/gift": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kindness-quest/gift.jpg",
  "kindness-quest/end": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kindness-quest/end.jpg",
  "light-treasure/title": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/light-treasure/title.jpg",
  "light-treasure/call": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/light-treasure/call.jpg",
  "light-treasure/journey": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/light-treasure/journey.jpg",
  "light-treasure/discovery": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/light-treasure/discovery.jpg",
  "light-treasure/end": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/light-treasure/end.jpg",
};


type FluxResult = {
  imageUrl: string;
  provider: "fal" | "placeholder";
};

const STYLE_SUFFIX =
  "Cozy watercolor children's book illustration, soft painterly style, warm gentle colors, storybook aesthetic, soft lighting, subtle texture, high detail, beautiful children's book art, no text, no watermark, no real people, no faces";

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
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${googleKey}`,
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

function fallbackPlaceholder(_prompt: string): FluxResult {
  // Use a generic kingdom placeholder instead of showing the prompt text
  return {
    imageUrl: `https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/dragon-slayer/title.jpg`,
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
/**
 * Generate a watercolor scene featuring the child from the uploaded portrait.
 * Uses Gemini multimodal to place the character in a storybook scene.
 */
async function generateWithCharacterPortrait(options: {
  prompt: string;
  characterPhotoB64: string;
}): Promise<FluxResult> {
  const googleKey = process.env.GOOGLE_AI_API_KEY;
  if (!googleKey) return fallbackPlaceholder(options.prompt);

  const STYLE = "Classic watercolor children's storybook illustration style, fine black ink outlines, soft pastel watercolor fills, warm cream paper background, decorative vine border frame, whimsical and magical, no text, no watermark";

  const fullPrompt = `Take the child in this photo and place them as the hero in this scene: ${options.prompt}. Draw them in ${STYLE}. The character should look like the child in the photo but rendered as a storybook illustration. Keep their face and features recognizable but in watercolor art style.`;

  try {
    const res = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=\${googleKey}\`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: fullPrompt },
              { inlineData: { mimeType: "image/jpeg", data: options.characterPhotoB64 } }
            ]
          }],
          generationConfig: { responseModalities: ["image", "text"] }
        })
      }
    );

    if (res.ok) {
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          // Convert base64 to data URL
          const dataUrl = \`data:image/jpeg;base64,\${part.inlineData.data}\`;
          return { imageUrl: dataUrl, provider: "fal" };
        }
      }
    }
    console.error("Gemini character scene failed:", res.status);
  } catch (err) {
    console.error("Gemini character scene error:", err);
  }

  return fallbackPlaceholder(options.prompt);
}


export async function generateStoryIllustration(options: {
  prompt: string;
  referenceImageUrl?: string | null;
  characterPhotoUrl?: string | null;
}): Promise<FluxResult> {
  // If character portrait provided as base64, use Gemini to place them in the scene
  if (options.characterPhotoUrl?.startsWith("data:image")) {
    const b64 = options.characterPhotoUrl.split(",")[1];
    if (b64) {
      return generateWithCharacterPortrait({
        prompt: options.prompt,
        characterPhotoB64: b64,
      });
    }
  }
  // Otherwise generate a background scene with Imagen 4.0
  return generateWithImagen4(options.prompt);
}

const SET_NAME_TO_ID: Record<Exclude<KingdomSet, null>, keyof PhotosBySet> = {
  "Throne Room": "throne-room",
  "Royal Forest": "royal-forest",
  "Royal Garden": "royal-garden",
  "Chastle": "chastle",
};

/** Flatten photos_by_set into a single list */
export function flattenPhotosBySet(photosBySet: PhotosBySet): string[] {
  return SET_UPLOAD_SLOTS.flatMap((slot) => photosBySet[slot.id] ?? []);
}

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

  // NOTE: Character portrait upload is saved for future face-compositing feature.
  // For now, Mode A = real session photos, Mode B = pure AI watercolor (no faces).

  // Round-robin cursor per set so multiple photos on one set rotate
  const setCursors: Partial<Record<keyof PhotosBySet, number>> = {};
  let flatCursor = 0;
  const result: StoryPage[] = [];

  for (const page of pages) {
    // FIRST: Static scenes for title/call/victory/end pages
    // BUT if a character photo is uploaded, action pages (dragon etc) get personalized
    const isActionScene = page.staticScene && !["dragon-slayer/title","dragon-slayer/call","rescue-mission/title","rescue-mission/call","lost-crown/title","lost-crown/call","forest-guardian/title","forest-guardian/call","kindness-quest/title","kindness-quest/call","light-treasure/title","light-treasure/call"].includes(page.staticScene ?? "");
    
    if (page.staticScene && STATIC_SCENES[page.staticScene] && (!characterPhoto || !isActionScene)) {
      result.push({ ...page, imageUrl: STATIC_SCENES[page.staticScene] });
      continue;
    }

    // SECOND: Use session photos for set pages
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

    // Only use flat fallback if useSessionPhoto is explicitly true AND this page
    // doesn't have a specific photoSet (avoid cross-contaminating set photos)
    const preferPhoto = page.useSessionPhoto && !page.photoSet;
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

    // Generate AI scene — with character portrait if uploaded, otherwise scene only
    const art = await generateStoryIllustration({
      prompt: page.imagePrompt ?? page.title,
      referenceImageUrl: reference,
      characterPhotoUrl: characterPhoto ?? null,
    });

    result.push({ ...page, imageUrl: art.imageUrl });
  }

  return result;
}
