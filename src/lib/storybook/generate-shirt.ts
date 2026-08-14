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
      let score = 10 - Math.min(index, 9);
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

  const cutoutRemote = await removeBackgroundUrl(sourcePageImageUrl);
  const composed = await compositeCutoutOnWhiteTee(cutoutRemote);

  const stamp = Date.now();
  let mockupUrl: string | null = await uploadBytesToSupabase(
    composed.buffer,
    `shirts/${options.bookId}/mockup-${stamp}.jpg`,
    "image/jpeg"
  );

  let durableCutout = cutoutRemote;
  try {
    if (cutoutRemote !== sourcePageImageUrl) {
      const cutBuf = await fetchBuffer(cutoutRemote);
      const uploadedCut = await uploadBytesToSupabase(
        cutBuf,
        `shirts/${options.bookId}/cutout-${stamp}.png`,
        "image/png"
      );
      if (uploadedCut) durableCutout = uploadedCut;
    }
  } catch {
    /* keep fal url */
  }

  if (!mockupUrl) {
    // Last resort: data URL is too big for notes; throw so UI can show error
    throw new Error("Failed to upload shirt mockup to storage");
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
