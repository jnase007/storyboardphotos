/**
 * Per-book white-tee mockup:
 * take the book's hero illustration → remove background → composite onto the
 * approved blank white tee product photo.
 * Never reuse a shared Raelyn/default character tee.
 */

import path from "path";
import { readFile } from "fs/promises";
import type { StoryPage } from "./types";

export type ShirtMockupResult = {
  mockupUrl: string;
  cutoutUrl: string;
  sourcePageImageUrl: string;
  provider: string;
  characterCardUrl?: string | null;
};

export type CharacterCardResult = {
  characterCardUrl: string;
  cutoutUrl: string;
  provider: string;
  notes: string;
};

function falKey(): string | null {
  return process.env.FAL_KEY ?? process.env.FAL_API_KEY ?? null;
}

/** Prefer a solo full-body / cover-ish page with a real illustration URL. */
export function pickHeroPageImage(pages: StoryPage[] | null | undefined): string | null {
  if (!Array.isArray(pages) || pages.length === 0) return null;
  const scored = pages
    .map((p, index) => {
      const url = typeof p?.imageUrl === "string" ? p.imageUrl : "";
      if (!url.startsWith("http")) return null;
      const blob = `${p.title || ""} ${p.imagePrompt || ""} ${p.text || ""}`.toLowerCase();
      let score = 10 - Math.min(index, 9);
      // Prefer ending/solo beats over group race/start pages
      if (/true winner|victory|crown|finale|return|end/.test(blob)) score += 12;
      if (/title|cover|call|hero|portrait|throne/.test(blob)) score += 6;
      if (/full body|full-body|standing/.test(blob)) score += 5;
      if (/race|together|friends|crowd|group|someone falls|stop and help/.test(blob)) score -= 8;
      if (/dragon|map only/.test(blob)) score -= 3;
      // Later pages often have cleaner solo hero framing
      if (index >= Math.max(0, pages.length - 2)) score += 4;
      return { url, score, index };
    })
    .filter(Boolean) as Array<{ url: string; score: number; index: number }>;
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].url;
}

function wardrobeLine(gender?: string | null): string {
  const g = (gender || "").toLowerCase();
  if (g === "boy" || g === "male") {
    return "wearing one locked royal adventure tunic, short cape, soft boots — NO crown";
  }
  return "wearing one locked soft blue-lavender royal adventure dress with small cape and soft boots — NO crown, NO tiara";
}

/**
 * Build the locked solo character card once per book from face photo (+ optional page ref).
 * This is the asset shirts should use — never a multi-kid scene.
 */
export async function generateLockedCharacterCard(options: {
  bookId: string;
  childName: string;
  gender?: string | null;
  characterPhotoUrl?: string | null;
  referencePageUrl?: string | null;
  notes?: string | null;
}): Promise<CharacterCardResult> {
  const key = falKey();
  if (!key) throw new Error("FAL_KEY required for character card");

  const name = options.childName || "the child";
  const wardrobe = wardrobeLine(options.gender);
  const ref =
    (options.referencePageUrl && options.referencePageUrl.startsWith("http")
      ? options.referencePageUrl
      : null) ||
    (options.characterPhotoUrl && options.characterPhotoUrl.startsWith("http")
      ? options.characterPhotoUrl
      : null);

  if (!ref && !(options.characterPhotoUrl || "").startsWith("data:")) {
    throw new Error("character photo or page reference required for character card");
  }

  const prompt = [
    `Solo full-body watercolor children's storybook character sticker of ONLY ${name}.`,
    "ONE child only — no siblings, no adults, no king, no animals, no crowd.",
    "Standing facing camera, head-to-toe, clean cream empty background for cutout.",
    "Same face likeness as the reference, same hair, same age, same skin tone.",
    "Big full detailed expressive eyes (never black dots).",
    wardrobe,
    "Soft pastel watercolor, gentle sepia ink outlines, premium fairytale picture-book quality.",
    "NO crown unless finale (no crown here), NO text, NO watermark, NO logo, NO shirt mockup.",
  ].join(" ");

  let characterUrl: string | null = null;
  let provider = "fal-flux-i2i";

  // Prefer image-to-image from a book page or hosted face URL
  if (ref) {
    const res = await fetch("https://fal.run/fal-ai/flux/dev/image-to-image", {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_url: ref,
        strength: 0.48,
        num_images: 1,
        image_size: "portrait_4_3",
        enable_safety_checker: true,
        output_format: "png",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      characterUrl = data?.images?.[0]?.url ?? data?.image?.url ?? null;
    } else {
      console.warn("character card i2i failed", await res.text());
    }
  }

  // Fallback: text-only if no usable ref result
  if (!characterUrl) {
    const res = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        num_images: 1,
        image_size: "portrait_4_3",
        enable_safety_checker: true,
        output_format: "png",
      }),
    });
    if (!res.ok) {
      throw new Error(`character card generate failed: ${await res.text()}`);
    }
    const data = await res.json();
    characterUrl = data?.images?.[0]?.url ?? data?.image?.url ?? null;
    provider = "fal-flux-t2i";
  }

  if (!characterUrl) throw new Error("character card returned no image");

  const cutoutRemote = await removeBackgroundUrl(characterUrl);
  const stamp = Date.now();

  let durableCard = characterUrl;
  let durableCutout = cutoutRemote;
  try {
    const cardBuf = await fetchBuffer(characterUrl);
    const upCard = await uploadBytesToSupabase(
      cardBuf,
      `shirts/${options.bookId}/character-card-${stamp}.png`,
      "image/png"
    );
    if (upCard) durableCard = upCard;
  } catch {
    /* keep fal */
  }
  try {
    if (cutoutRemote !== characterUrl) {
      const cutBuf = await fetchBuffer(cutoutRemote);
      const upCut = await uploadBytesToSupabase(
        cutBuf,
        `shirts/${options.bookId}/character-cutout-${stamp}.png`,
        "image/png"
      );
      if (upCut) durableCutout = upCut;
    }
  } catch {
    /* keep fal */
  }

  let notes = options.notes || "";
  notes = upsertNoteTag(notes, "CharacterCard", durableCard);
  notes = upsertNoteTag(notes, "CharacterCutout", durableCutout);

  return {
    characterCardUrl: durableCard,
    cutoutUrl: durableCutout,
    provider,
    notes,
  };
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
  bytes: Buffer,
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
        body: new Uint8Array(bytes),
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

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

async function loadBlankWhiteTee(): Promise<Buffer> {
  // Prefer TRUE blank tee plates (no character print). Never use Raelyn reference plate.
  const candidates = [
    path.join(process.cwd(), "public/merch/blank-white-tee.jpg"),
    path.join(process.cwd(), "public/merch/approved-white-tee.jpg"),
    path.join(process.cwd(), "public/brand/merch-tee-white-notext-approved.jpg"),
  ];
  for (const file of candidates) {
    try {
      return await readFile(file);
    } catch {
      /* try next */
    }
  }
  // Hosted fallback — blank plate first
  try {
    return await fetchBuffer("https://www.storybookphotos.com/merch/blank-white-tee.jpg");
  } catch {
    return fetchBuffer("https://www.storybookphotos.com/merch/approved-white-tee.jpg");
  }
}

/**
 * Real product mockup: paste transparent cutout onto blank white tee photo.
 * Uses sharp — no AI rewrite of the character.
 */
async function compositeCutoutOnWhiteTee(cutoutUrl: string): Promise<{
  buffer: Buffer;
  provider: string;
}> {
  // Dynamic import so local scripts without sharp still typecheck if needed
  const sharp = (await import("sharp")).default;

  const [teeBuf, cutBuf] = await Promise.all([
    loadBlankWhiteTee(),
    fetchBuffer(cutoutUrl),
  ]);

  const tee = sharp(teeBuf).ensureAlpha();
  const teeMeta = await tee.metadata();
  const tw = teeMeta.width || 1024;
  const th = teeMeta.height || 1280;

  // Trim transparent margins on cutout, then size for chest print
  const cutTrimmed = await sharp(cutBuf).ensureAlpha().trim().png().toBuffer();
  const cutMeta = await sharp(cutTrimmed).metadata();
  const cw = cutMeta.width || 512;
  const ch = cutMeta.height || 512;

  // Large front-chest print so the book's character is obvious on the tee
  let targetW = Math.round(tw * 0.54);
  let targetH = Math.round((ch / Math.max(cw, 1)) * targetW);
  const maxH = Math.round(th * 0.52);
  if (targetH > maxH) {
    const scale = maxH / targetH;
    targetW = Math.max(80, Math.round(targetW * scale));
    targetH = Math.max(80, Math.round(targetH * scale));
  }

  const cutResized = await sharp(cutTrimmed)
    .resize(targetW, targetH, { fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();
  const cutFinalMeta = await sharp(cutResized).metadata();
  const fw = cutFinalMeta.width || targetW;
  const fh = cutFinalMeta.height || targetH;

  const left = Math.max(0, Math.round((tw - fw) / 2));
  const top = Math.max(0, Math.round(th * 0.27));

  const mockup = await sharp(teeBuf)
    .ensureAlpha()
    .composite([{ input: cutResized, left, top }])
    .jpeg({ quality: 92 })
    .toBuffer();

  return { buffer: mockup, provider: "sharp-cutout-on-white-tee" };
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
 * Build per-book shirt assets.
 * Prefer locked solo character cutout (from book create) — never multi-kid scenes.
 */
export async function generateShirtMockupForBook(options: {
  bookId: string;
  childName: string;
  gender?: string | null;
  pages: StoryPage[];
  notes?: string | null;
  /** Prebuilt solo character card / cutout from book create */
  characterCardUrl?: string | null;
  characterCutoutUrl?: string | null;
  characterPhotoUrl?: string | null;
}): Promise<ShirtMockupResult & { notes: string }> {
  let notes = options.notes || "";
  let characterCardUrl =
    options.characterCardUrl ||
    readNoteTag(notes, "CharacterCard") ||
    null;
  let cutoutRemote =
    options.characterCutoutUrl ||
    readNoteTag(notes, "CharacterCutout") ||
    null;
  let sourcePageImageUrl = characterCardUrl;
  let providerExtra = "character-card";

  // If no locked character card yet, build one now (face photo + best solo page ref).
  if (!cutoutRemote) {
    const pageRef = pickHeroPageImage(options.pages);
    try {
      const card = await generateLockedCharacterCard({
        bookId: options.bookId,
        childName: options.childName,
        gender: options.gender,
        characterPhotoUrl: options.characterPhotoUrl,
        referencePageUrl: pageRef || characterCardUrl,
        notes,
      });
      notes = card.notes;
      characterCardUrl = card.characterCardUrl;
      cutoutRemote = card.cutoutUrl;
      sourcePageImageUrl = card.characterCardUrl;
      providerExtra = card.provider;
    } catch (err) {
      console.warn("character card failed, falling back to page cutout", err);
      sourcePageImageUrl = pageRef;
      if (!sourcePageImageUrl) {
        throw new Error("No illustrated page available for shirt mockup");
      }
      cutoutRemote = await removeBackgroundUrl(sourcePageImageUrl);
      providerExtra = "page-fallback";
    }
  }

  if (!cutoutRemote) {
    throw new Error("No cutout available for shirt mockup");
  }
  if (!sourcePageImageUrl) sourcePageImageUrl = cutoutRemote;

  const composed = await compositeCutoutOnWhiteTee(cutoutRemote);

  const stamp = Date.now();
  let mockupUrl: string | null = await uploadBytesToSupabase(
    composed.buffer,
    `shirts/${options.bookId}/mockup-${stamp}.jpg`,
    "image/jpeg"
  );

  let durableCutout = cutoutRemote;
  try {
    const cutBuf = await fetchBuffer(cutoutRemote);
    const uploadedCut = await uploadBytesToSupabase(
      cutBuf,
      `shirts/${options.bookId}/cutout-${stamp}.png`,
      "image/png"
    );
    if (uploadedCut) durableCutout = uploadedCut;
  } catch {
    /* keep existing url */
  }

  if (!mockupUrl) {
    throw new Error("Failed to upload shirt mockup to storage");
  }

  notes = upsertNoteTag(notes, "ShirtMockup", mockupUrl);
  notes = upsertNoteTag(notes, "ShirtCutout", durableCutout);
  notes = upsertNoteTag(notes, "ShirtSource", sourcePageImageUrl);
  if (characterCardUrl) {
    notes = upsertNoteTag(notes, "CharacterCard", characterCardUrl);
  }

  return {
    mockupUrl,
    cutoutUrl: durableCutout,
    sourcePageImageUrl,
    provider: `${composed.provider}+${providerExtra}`,
    characterCardUrl,
    notes,
  };
}
