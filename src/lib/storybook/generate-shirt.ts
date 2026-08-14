/**
 * Per-book white-tee mockup:
 * take the book's hero illustration → cut out background → place on white shirt.
 * Never reuse a shared Raelyn/default tee art.
 */

import type { StoryPage } from "./types";

const WHITE_TEE_PUBLIC =
  process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/merch/approved-white-tee.jpg`
    : "https://www.storybookphotos.com/merch/approved-white-tee.jpg";

export type ShirtMockupResult = {
  mockupUrl: string;
  cutoutUrl: string;
  sourcePageImageUrl: string;
  provider: string;
};

function falKey(): string | null {
  return process.env.FAL_KEY ?? process.env.FAL_API_KEY ?? null;
}

/** Prefer a full-body / cover-ish page with a real illustration URL. */
export function pickHeroPageImage(pages: StoryPage[] | null | undefined): string | null {
  if (!Array.isArray(pages) || pages.length === 0) return null;
  const scored = pages
    .map((p, index) => {
      const url = typeof p?.imageUrl === "string" ? p.imageUrl : "";
      if (!url.startsWith("http")) return null;
      const blob = `${p.title || ""} ${p.imagePrompt || ""} ${p.text || ""}`.toLowerCase();
      let score = 10 - Math.min(index, 9); // earlier pages slightly preferred
      if (/title|cover|call|hero|portrait|throne/.test(blob)) score += 8;
      if (/full body|full-body|standing/.test(blob)) score += 5;
      if (/dragon|crowd|map only/.test(blob)) score -= 3;
      return { url, score, index };
    })
    .filter(Boolean) as Array<{ url: string; score: number; index: number }>;
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].url;
}

export async function removeBackgroundUrl(imageUrl: string): Promise<string> {
  const key = falKey();
  if (!key) return imageUrl;
  try {
    const res = await fetch("https://fal.run/fal-ai/bria/background/remove", {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    if (!res.ok) {
      console.warn("shirt bg remove failed", await res.text());
      return imageUrl;
    }
    const data = await res.json();
    const url = data?.image?.url ?? data?.images?.[0]?.url;
    return typeof url === "string" ? url : imageUrl;
  } catch (err) {
    console.warn("shirt bg remove error", err);
    return imageUrl;
  }
}

async function uploadBytesToSupabase(
  bytes: ArrayBuffer,
  filename: string,
  contentType: string
): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey || serviceKey === "[SENSITIVE]") return null;

    const res = await fetch(
      `${supabaseUrl}/storage/v1/object/storybook-assets/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: Buffer.from(bytes),
      }
    );
    if (!res.ok) {
      console.warn("shirt upload failed", res.status, await res.text());
      return null;
    }
    return `${supabaseUrl}/storage/v1/object/public/storybook-assets/${filename}`;
  } catch (err) {
    console.warn("shirt upload error", err);
    return null;
  }
}

/**
 * Composite cutout character onto the approved white tee via fal image edit.
 * Falls back to returning the cutout URL if mockup generation fails.
 */
async function compositeCutoutOnWhiteTee(options: {
  cutoutUrl: string;
  childName: string;
  role: string;
}): Promise<{ url: string; provider: string }> {
  const key = falKey();
  if (!key) return { url: options.cutoutUrl, provider: "cutout-only" };

  const prompt = [
    "Product photo of a plain WHITE kids t-shirt on a soft cream background.",
    "Print this exact storybook character cutout as a large front-chest DTG design, centered.",
    `Character is ${options.role} ${options.childName} from a children's watercolor storybook.`,
    "Keep the shirt white. Keep the character likeness, outfit, and colors from the reference cutout.",
    "No extra logos, no text, no watermark, no other kids, no Raelyn default art.",
    "Clean merch mockup, centered composition, high quality.",
  ].join(" ");

  // Prefer image-to-image from the cutout (character locked); model paints shirt around/under print.
  const attempts: Array<{ model: string; body: Record<string, unknown> }> = [
    {
      model: "fal-ai/flux/dev/image-to-image",
      body: {
        prompt,
        image_url: options.cutoutUrl,
        strength: 0.62,
        image_size: { width: 1024, height: 1280 },
        num_inference_steps: 28,
        guidance_scale: 3.5,
        enable_safety_checker: true,
        output_format: "jpeg",
      },
    },
    {
      // Second try: start from blank white tee product shot, steer toward character print
      model: "fal-ai/flux/dev/image-to-image",
      body: {
        prompt:
          prompt +
          " Base garment is a blank white tee product photo; only add the chest character print.",
        image_url: WHITE_TEE_PUBLIC,
        strength: 0.48,
        image_size: { width: 1024, height: 1280 },
        num_inference_steps: 28,
        output_format: "jpeg",
      },
    },
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch(`https://fal.run/${attempt.model}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attempt.body),
      });
      if (!res.ok) {
        console.warn("shirt composite fail", attempt.model, await res.text());
        continue;
      }
      const data = await res.json();
      const url =
        data?.images?.[0]?.url ?? data?.image?.url ?? data?.image_url ?? null;
      if (typeof url === "string" && url.startsWith("http")) {
        return { url, provider: attempt.model };
      }
    } catch (err) {
      console.warn("shirt composite error", attempt.model, err);
    }
  }

  return { url: options.cutoutUrl, provider: "cutout-only" };
}

function upsertNoteTag(notes: string | null | undefined, tag: string, value: string): string {
  const base = (notes || "").replace(new RegExp(`\\[${tag}:[^\\]]*\\]`, "g"), "").trim();
  const piece = `[${tag}: ${value}]`;
  return base ? `${piece} ${base}` : piece;
}

export function readNoteTag(notes: string | null | undefined, tag: string): string | null {
  if (!notes) return null;
  const m = notes.match(new RegExp(`\\[${tag}:\\s*([^\\]]+)\\]`));
  return m?.[1]?.trim() || null;
}

/**
 * Build per-book shirt assets from illustrated pages.
 */
export async function generateShirtMockupForBook(options: {
  bookId: string;
  childName: string;
  gender?: string | null;
  pages: StoryPage[];
  notes?: string | null;
}): Promise<ShirtMockupResult & { notes: string }> {
  const sourcePageImageUrl = pickHeroPageImage(options.pages);
  if (!sourcePageImageUrl) {
    throw new Error("No illustrated page available for shirt mockup");
  }

  const role =
    options.gender === "boy" ? "King" : options.gender === "girl" ? "Queen" : "Hero";

  const cutoutUrl = await removeBackgroundUrl(sourcePageImageUrl);
  const composed = await compositeCutoutOnWhiteTee({
    cutoutUrl,
    childName: options.childName,
    role,
  });

  // Prefer durable supabase copies when possible
  let mockupUrl = composed.url;
  let durableCutout = cutoutUrl;
  try {
    const mockRes = await fetch(composed.url);
    if (mockRes.ok) {
      const buf = await mockRes.arrayBuffer();
      const ctype = mockRes.headers.get("content-type") || "image/jpeg";
      const ext = ctype.includes("png") ? "png" : "jpg";
      const uploaded = await uploadBytesToSupabase(
        buf,
        `shirts/${options.bookId}/mockup-${Date.now()}.${ext}`,
        ctype
      );
      if (uploaded) mockupUrl = uploaded;
    }
  } catch {
    /* keep fal url */
  }
  try {
    if (cutoutUrl !== sourcePageImageUrl) {
      const cutRes = await fetch(cutoutUrl);
      if (cutRes.ok) {
        const buf = await cutRes.arrayBuffer();
        const uploaded = await uploadBytesToSupabase(
          buf,
          `shirts/${options.bookId}/cutout-${Date.now()}.png`,
          "image/png"
        );
        if (uploaded) durableCutout = uploaded;
      }
    }
  } catch {
    /* keep fal url */
  }

  let notes = options.notes || "";
  notes = upsertNoteTag(notes, "ShirtMockup", mockupUrl);
  notes = upsertNoteTag(notes, "ShirtCutout", durableCutout);
  notes = upsertNoteTag(notes, "ShirtSource", sourcePageImageUrl);

  return {
    mockupUrl,
    cutoutUrl: durableCutout,
    sourcePageImageUrl,
    provider: composed.provider,
    notes,
  };
}
