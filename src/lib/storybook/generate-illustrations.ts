import type { KingdomSet, PhotosBySet, StoryPage } from "./types";
import { SET_UPLOAD_SLOTS } from "./types";


/** Pre-approved watercolor scene illustrations — used instead of generating new AI images */
export const STATIC_SCENES: Record<string, string> = {
  "kingdom-map": "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/kingdom-map.jpg",
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

/**
 * Book geometry (Mpix 8.25" square page):
 * illustration band is the TOP of the page (~4:3 landscape), full bleed edge-to-edge.
 * Art must FILL the canvas — no vine frames, no side letterbox, no matte borders.
 */
export const STORYBOOK_IMAGE_ASPECT = "4:3" as const;

/**
 * Target look (locked to Justin's style ref):
 * whimsical watercolor + soft sepia/ink outlines on cream paper —
 * classic fairytale children's book, NOT bare uncolored line art.
 */
const STYLE_SUFFIX =
  "ONE single full-bleed 4:3 landscape watercolor children's storybook illustration only — not a diptych, not two panels, not a double-page spread, not split screen, not collage. FILL THE ENTIRE CANVAS edge-to-edge with the scene (background, sky, forest, castle continue to all four edges). NO decorative vine border, NO floral frame, NO oval matte, NO white or cream margins inside the image, NO picture-frame border. Whimsical watercolor, soft sepia ink outlines with gentle hand-drawn line variation, soft pastel watercolor washes (sage green, dusty lavender, peach, powder blue, warm gold), cream textured watercolor paper only as the painted ground not as empty side bars, cute storybook character proportions with big expressive eyes, atmospheric depth, warm golden sunlight and gentle wonder of creation, soft dust motes in sunbeams, premium faith-friendly fairytale picture-book quality (Narnia warmth not occult), NO magic wands, NO glowing staffs, NO scepters with energy beams, NO spell casting, NO witches, NO wizards, NO fairies casting spells, NO glowing runes, NO sorcery props, child may hold a simple lantern or flowers only, consistent character across pages, FULL FIGURE hero visible with headroom above crown and feet still in frame, never crop head face crown hands or feet, no photorealism, no real photographs, no 3D render, no harsh pure-black vector lines, no empty uncolored coloring-page look, no muddy gray, no text, no letters, no watermark, no logo, no signature";

/** Locked royal wardrobe for the whole book — same clothes every page. */
export function lockedHeroWardrobe(gender?: string | null): string {
  const g = (gender || "").toLowerCase();
  if (g === "girl") {
    return [
      "LOCKED HERO WARDROBE (identical on EVERY page of this book — do not redesign clothes):",
      "Queen outfit: soft rose-blush and ivory princess gown with gentle gold trim,",
      "same small gold crown every page, same rose sash, same soft ivory slippers,",
      "same hair style and hair color every page.",
      "CRITICAL: do NOT change dress color, do NOT swap into armor, riding gear, pajamas, modern clothes, or a new gown.",
      "Pose and background may change; face likeness + this exact royal outfit stay fixed.",
    ].join(" ");
  }
  // default King / boy
  return [
    "LOCKED HERO WARDROBE (identical on EVERY page of this book — do not redesign clothes):",
    "King outfit: royal navy-blue tunic with warm gold trim and soft red cape,",
    "same small gold crown every page, same brown belt, same soft leather boots,",
    "same hair style and hair color every page.",
    "CRITICAL: do NOT change tunic color, do NOT swap into armor, pajamas, modern clothes, or a new costume.",
    "Pose and background may change; face likeness + this exact royal outfit stay fixed.",
  ].join(" ");
}

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
        image_size: "landscape_4_3",
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
    "ONE full-bleed 4:3 landscape whimsical watercolor children's storybook illustration only (not diptych, not two panels, not double-page spread), soft sepia ink outlines, gentle pastel watercolor washes, scene painted edge-to-edge with NO vine border NO floral frame NO white side margins, enchanted kingdom, atmospheric depth, fairytale picture-book quality, full figure hero with headroom, no photorealism, no empty line-art coloring page, no text, no watermark";

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
            // Match storybook image band (top of 8.25" square page)
            aspectRatio: STORYBOOK_IMAGE_ASPECT,
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

async function uploadToSupabase(dataUrl: string, filename: string): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return null;

    const b64 = dataUrl.split(",")[1];
    if (!b64) return null;
    
    const buffer = Buffer.from(b64, "base64");
    
    const res = await fetch(`${supabaseUrl}/storage/v1/object/storybook-assets/${filename}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (res.ok) {
      return `${supabaseUrl}/storage/v1/object/public/storybook-assets/${filename}`;
    }
    return null;
  } catch {
    return null;
  }
}


async function generateWithCharacterPortrait(options: {
  prompt: string;
  characterPhotoB64: string;
  gender?: string | null;
}): Promise<FluxResult> {
  const googleKey = process.env.GOOGLE_AI_API_KEY;
  if (!googleKey) return fallbackPlaceholder(options.prompt);

  const STYLE = "ONE full-bleed 4:3 landscape whimsical watercolor children's storybook illustration only (not diptych, not two panels, not double-page, not collage), soft sepia ink outlines, soft pastel watercolor washes, cute storybook proportions, big expressive eyes, warm golden sunlight, faith-friendly fairytale picture-book quality, NO wands NO spells NO sorcery, scene fills entire canvas edge-to-edge, no photorealism, no empty uncolored coloring-page look, no text, no watermark";
  const wardrobe = lockedHeroWardrobe(options.gender);

  const fullPrompt = `Create ONE premium watercolor children's storybook illustration (ink + soft color washes — NOT a blank coloring page). Single scene only. Canvas is 4:3 landscape and must be FULL BLEED.

FACE LIKENESS (critical): Study the child's face in the reference photo. Paint/draw the hero as a charming royal storybook character that clearly resembles this child — same age vibe, hair, face shape, expression — stylized into soft watercolor + ink (not a photo, not realistic skin).

${wardrobe}

SCENE: ${options.prompt}

STYLE: ${STYLE}

RULES:
- Exactly ONE illustration / one scene in the whole image
- Do NOT draw two side-by-side pages, panels, or mirrored scenes
- FILL the entire image edge-to-edge — background continues to all four edges
- NO decorative vine border, NO floral frame, NO oval vignette, NO white/cream side bars, NO picture mat
- Hero is center stage, readable silhouette, proud kind pose
- FULL BODY in frame: entire head, crown/hair, face, hands, feet — headroom above crown, feet still visible
- NEVER crop or cut off the head, face, crown, arms, or feet
- Same character design AND the exact same locked royal outfit on every page of this book
- Soft watercolor color throughout (pastels), not empty line art
- No real photo collage, no half-photo face, no text`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${googleKey}`,
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
          const dataUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
          // Upload to Supabase so PDF can load it server-side
          const filename = `character-scenes/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
          const publicUrl = await uploadToSupabase(dataUrl, filename);
          return { imageUrl: publicUrl ?? dataUrl, provider: "fal" };
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
  gender?: string | null;
}): Promise<FluxResult> {
  const wardrobe = lockedHeroWardrobe(options.gender);
  const promptWithWardrobe = `${options.prompt}. ${wardrobe}`;
  // If character portrait provided as base64, use Gemini to place them in the scene
  if (options.characterPhotoUrl?.startsWith("data:image")) {
    const b64 = options.characterPhotoUrl.split(",")[1];
    if (b64) {
      return generateWithCharacterPortrait({
        prompt: promptWithWardrobe,
        characterPhotoB64: b64,
        gender: options.gender,
      });
    }
  }
  // Otherwise generate a background scene with Imagen 4.0
  return generateWithImagen4(promptWithWardrobe);
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
  /** Kid face / profile photo — used only as likeness reference, never printed as a real photo */
  characterPhoto?: string | null;
  /** boy/girl — locks King vs Queen wardrobe for the whole book */
  gender?: string | null;
}): Promise<StoryPage[]> {
  const { pages, characterPhoto, gender } = options;
  // Product rule: book + movie are 100% illustrated watercolor storybook art (no real session photos).
  // Real session photos are NEVER placed in pages. Face upload = likeness only.
  const result: StoryPage[] = [];
  const usedSceneKeys: string[] = [];
  const wardrobe = lockedHeroWardrobe(gender);

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    if (page.imageUrl && !looksLikeRealPhotoUrl(page.imageUrl)) {
      result.push(page);
      usedSceneKeys.push(sceneKey(page));
      continue;
    }

    const uniqueness = uniqueSceneDirective(page, index, pages, usedSceneKeys);
    const sceneHint = page.imagePrompt ?? page.title;
    const prompt = `${sceneHint}. ${wardrobe}. ${uniqueness}. ${STYLE_SUFFIX}. Full-bleed 4:3 children's watercolor storybook illustration for an 8.25 inch square printed book image band. CRITICAL: edge-to-edge scene, no vine frame, no side white space. Show the complete child hero from head to toe with headroom above the crown — never cut off the head. SAME outfit as every other page. NO glowing staff, NO wand, NO scepter beam, NO spell props.`;

    const art = await generateStoryIllustration({
      prompt,
      characterPhotoUrl: characterPhoto ?? null,
      gender,
    });

    const next = {
      ...page,
      // Never keep session photo flags on output pages
      useSessionPhoto: false,
      imageUrl: art.imageUrl,
    };
    result.push(next);
    usedSceneKeys.push(sceneKey(next));
  }

  return result;
}

function sceneKey(page: Pick<StoryPage, "title" | "text" | "imagePrompt" | "staticScene">): string {
  return [page.staticScene, page.title, (page.imagePrompt || "").slice(0, 80), (page.text || "").slice(0, 60)]
    .filter(Boolean)
    .join("|")
    .toLowerCase();
}

/** Force each page into a distinct composition so cover/call/etc never clone each other. */
function uniqueSceneDirective(
  page: StoryPage,
  index: number,
  all: StoryPage[],
  used: string[]
): string {
  const title = (page.title || "").toLowerCase();
  const prevTitles = all
    .slice(0, index)
    .map((p) => p.title)
    .filter(Boolean)
    .join(", ");

  const angleBank = [
    "COMPOSITION A: wide establishing landscape, hero small-to-medium in lower third, deep forest path leading away",
    "COMPOSITION B: medium full-body hero center stage, different background architecture or garden than any prior page",
    "COMPOSITION C: three-quarter view hero walking toward a NEW landmark (bridge, gate, throne steps, garden arch) — not a copy of prior page",
    "COMPOSITION D: intimate garden or courtyard beat with different props (flowers, map, lantern on a post — never a wand)",
    "COMPOSITION E: elevated overlook / castle balcony / hill crest with kingdom vista behind hero",
    "COMPOSITION F: nighttime-soft or golden-hour return scene with warm windows and celebration energy",
    "COMPOSITION G: quiet ending vignette at a window or tower with calm sky — unique from action pages",
  ];
  const angle = angleBank[index % angleBank.length];

  let beat = "unique story beat";
  if (index === 0 || title.includes("title")) {
    beat =
      "COVER/OPENING PORTRAIT ONLY: hero facing viewer in a simple royal portrait setting (soft throne or garden arch). Do NOT reuse the deep lantern-forest action composition from later pages.";
  } else if (title.includes("call")) {
    beat =
      "THE CALL beat: courtyard or throne-adjacent outdoor steps receiving news — NOT the same deep forest portrait as the cover. Different location, different pose, different background.";
  } else if (title.includes("throne")) {
    beat = "THRONE ROOM interior: marble, banners, throne — clearly indoor castle architecture";
  } else if (title.includes("forest")) {
    beat = "ROYAL FOREST path scene with lanterns and trees — only if this page is the forest chapter";
  } else if (title.includes("garden")) {
    beat = "ROYAL GARDEN with roses and open sky — not forest canopy";
  } else if (title.includes("courage") || title.includes("chastle") || title.includes("quest")) {
    beat = "COURAGE QUEST stone overlook / bridge landmark — not forest and not garden";
  } else if (title.includes("return") || title.includes("rejoice") || title.includes("end")) {
    beat = "RETURN/ENDING castle gates or quiet night window — distinct from opening portrait";
  }

  return [
    `PAGE ${index + 1} MUST be a COMPLETELY DIFFERENT scene/composition from every earlier page.`,
    prevTitles ? `Do NOT repeat compositions used for: ${prevTitles}.` : "",
    used.length ? `Already used scene keys: ${used.slice(-4).join(" || ")}.` : "",
    beat,
    angle,
    "Same child likeness and the EXACT same locked royal outfit/colors/crown every page — only NEW pose, NEW camera angle, NEW background landmark. Never a clothing change.",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Heuristic: block obvious studio/session photo paths from being reused as page art */
function looksLikeRealPhotoUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("/session") ||
    u.includes("session-photo") ||
    u.includes("set-photo") ||
    u.includes("raw-upload")
  );
}
