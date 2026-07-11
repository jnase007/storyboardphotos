import { jsPDF } from "jspdf";
import type { StoryPage } from "./types";

// ─── Brand Colors ────────────────────────────────────────────────────────────
const ROYAL_BLUE   = [10,  22,  40]  as [number, number, number]; // #0A1628
const GOLD         = [212, 176, 122] as [number, number, number]; // #D4B07A
const CREAM        = [248, 244, 236] as [number, number, number]; // #F8F4EC
const GOLD_DARK    = [180, 145,  88] as [number, number, number]; // darker gold for variety
const WHITE        = [255, 255, 255] as [number, number, number];

// ─── Page geometry (letter, points) ──────────────────────────────────────────
const PAGE_W = 594;  // 8.25" (8" + 0.125" bleed each side)
const PAGE_H = 594;  // 8.25" square
const BLEED  = 9;    // 0.125" bleed margin
const MARGIN = 36;   // 0.5" interior text margin

/**
 * Build a professional 8.5×11" Mpix-ready PDF of the storybook.
 * Includes a cover page, interior story pages, and a back cover.
 */
export async function buildStorybookPdf(options: {
  bookTitle: string;
  childName: string;
  pages: StoryPage[];
  includeCover?: boolean;
  includeBack?: boolean;
  coverImageUrl?: string;
  bookType?: "chronicles" | "portraits"; // which book type
}): Promise<Blob> {
  const {
    bookTitle,
    childName,
    pages,
    includeCover = true,
    includeBack = true,
    coverImageUrl,
    bookType = "chronicles",
  } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [594, 594],  // 8.25" x 8.25" square (8" + 0.125" bleed)
  });

  let pageCount = 0;

  // ── Cover page ────────────────────────────────────────────────────────────
  if (includeCover) {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    await drawCoverPageAsync(doc, childName, coverImageUrl, bookType);
  }

  // ── Interior pages ────────────────────────────────────────────────────────
  const totalStoryPages = pages.length;
  for (let i = 0; i < pages.length; i++) {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    await drawInteriorPage(doc, pages[i], i + 1, totalStoryPages, childName, bookTitle);
  }

  // ── Back cover ────────────────────────────────────────────────────────────
  if (includeBack) {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    drawBackCover(doc);
  }

  return doc.output("blob");
}

// ─────────────────────────────────────────────────────────────────────────────
// Cover Page
// ─────────────────────────────────────────────────────────────────────────────
async function drawCoverPageAsync(doc: jsPDF, childName: string, coverImageUrl?: string, bookType: "chronicles" | "portraits" = "chronicles"): Promise<void> {
  // Use AI-generated cover with child's face if available, otherwise use castle scene
  const CHRONICLES_COVER = "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/cover-template.jpg";
  const PORTRAITS_COVER = "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/portrait-album-cover.jpg";
  const COVER_URL = coverImageUrl ?? (bookType === "portraits" ? PORTRAITS_COVER : CHRONICLES_COVER);

  try {
    const img = await fetchImageAsDataUrl(COVER_URL);
    if (img) {
      const croppedDataUrl = await centerCropImage(img.dataUrl, PAGE_W / PAGE_H);
      doc.addImage(croppedDataUrl, "JPEG", 0, 0, PAGE_W, PAGE_H);
    } else {
      drawFallbackCover(doc);
    }
  } catch {
    drawFallbackCover(doc);
  }

  // Book title — light cream bands top and bottom
  const line1 = `${childName}'s`;
  const line2 = bookType === "portraits" ? "Royal Portraits" : "Kingdom Chronicles";

  // Light cream overlay at top for name
  doc.setFillColor(248, 244, 236);
  doc.setGState(doc.GState({ opacity: 0.88 }));
  doc.rect(0, 0, PAGE_W, PAGE_H * 0.20, "F");
  doc.setGState(doc.GState({ opacity: 1 }));

  // Light cream overlay at bottom for branding
  doc.setFillColor(248, 244, 236);
  doc.setGState(doc.GState({ opacity: 0.88 }));
  doc.rect(0, PAGE_H * 0.87, PAGE_W, PAGE_H * 0.13, "F");
  doc.setGState(doc.GState({ opacity: 1 }));

  // Gold border frame
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.rect(10, 10, PAGE_W - 20, PAGE_H - 20, "S");

  // Royal blue name text
  doc.setFont("times", "bolditalic");
  doc.setFontSize(48);
  doc.setTextColor(10, 22, 40);
  doc.text(line1, PAGE_W / 2, PAGE_H * 0.10, { align: "center" });

  // Gold subtitle
  doc.setFont("times", "italic");
  doc.setFontSize(34);
  doc.setTextColor(150, 100, 20);
  doc.text(line2, PAGE_W / 2, PAGE_H * 0.17, { align: "center" });

  // Bottom branding
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(150, 100, 20);
  doc.text("Storybook Photos · Kingdom Quests", PAGE_W / 2, PAGE_H * 0.93, { align: "center" });
}

function drawFallbackCover(doc: jsPDF): void {
  doc.setFillColor(...ROYAL_BLUE);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  drawCrown(doc, PAGE_W / 2, 220, 70, GOLD);
}

function drawCoverPage(doc: jsPDF, childName: string): void {
  // Full-page royal blue background
  doc.setFillColor(...ROYAL_BLUE);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Decorative gold border frame (inset from bleed)
  drawGoldBorder(doc, 24, 24, PAGE_W - 48, PAGE_H - 48);

  // Inner border
  drawGoldBorder(doc, 32, 32, PAGE_W - 64, PAGE_H - 64, 0.5);

  // Crown illustration (centered, upper third)
  drawCrown(doc, PAGE_W / 2, 220, 70, GOLD);

  // Stars above crown
  drawStar(doc, PAGE_W / 2 - 100, 165, 7, GOLD);
  drawStar(doc, PAGE_W / 2 + 100, 165, 7, GOLD);
  drawStar(doc, PAGE_W / 2, 140, 5, GOLD);

  // Main title
  doc.setTextColor(...GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(42);
  const title = `${childName}'s Kingdom Quest`;
  doc.text(title, PAGE_W / 2, 340, { align: "center", maxWidth: PAGE_W - MARGIN * 2 });

  // Decorative line under title
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(PAGE_W / 2 - 120, 358, PAGE_W / 2 + 120, 358);

  // Subtitle
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.setTextColor(...GOLD_DARK);
  doc.text("A Storybook Photos Adventure", PAGE_W / 2, 390, { align: "center" });

  // Decorative star row
  drawStar(doc, PAGE_W / 2 - 60, 420, 5, GOLD_DARK);
  drawStar(doc, PAGE_W / 2,       420, 7, GOLD);
  drawStar(doc, PAGE_W / 2 + 60, 420, 5, GOLD_DARK);

  // Footer branding
  doc.setFillColor(...GOLD);
  doc.rect(0, PAGE_H - 60, PAGE_W, 60, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...ROYAL_BLUE);
  doc.text("Storybook Photos  |  Kingdom Quests", PAGE_W / 2, PAGE_H - 30, { align: "center" });

  // Cover label in footer
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD_DARK);
  doc.text("Cover", PAGE_W - MARGIN - BLEED, PAGE_H - 68, { align: "right" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Interior Page
// ─────────────────────────────────────────────────────────────────────────────
async function drawInteriorPage(
  doc: jsPDF,
  page: StoryPage,
  pageNum: number,
  totalPages: number,
  childName: string,
  _bookTitle: string,
): Promise<void> {
  const imageAreaH = PAGE_H * 0.60;  // top 60% - more text space
  const textAreaY  = imageAreaH;      // bottom 30% text area
  const textAreaH  = PAGE_H - imageAreaH;

  // ── Image area (top 65%, edge-to-edge) ──────────────────────────────────
  // White background behind image area
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, PAGE_W, imageAreaH, "F");

  if (page.imageUrl && !page.imageUrl.includes("placehold.co")) {
    try {
      const img = await fetchImageAsDataUrl(page.imageUrl);
      if (img) {
        // Get image dimensions to calculate proper fit (no skewing)
        try {
          const props = doc.getImageProperties(img.dataUrl);
          const imgW = props.width;
          const imgH = props.height;
          const imgRatio = imgW / imgH;
          const areaRatio = PAGE_W / imageAreaH;

          let drawW, drawH, drawX, drawY;
          // Cover mode: fill the entire area, crop edges if needed (no white bars)
          if (imgRatio > areaRatio) {
            // Image wider than area — fit by height, crop left/right
            drawH = imageAreaH;
            drawW = imageAreaH * imgRatio;
            drawX = (PAGE_W - drawW) / 2;
            drawY = 0;
          } else {
            // Image taller than area — fit by width, crop top/bottom
            drawW = PAGE_W;
            drawH = PAGE_W / imgRatio;
            drawX = 0;
            drawY = (imageAreaH - drawH) / 2;
          }
          doc.addImage(img.dataUrl, img.format, drawX, drawY, drawW, drawH, undefined, "FAST");
        } catch {
          // Fallback: stretch to fill
          doc.addImage(img.dataUrl, img.format, 0, 0, PAGE_W, imageAreaH, undefined, "FAST");
        }
      } else {
        drawImagePlaceholder(doc, 0, 0, PAGE_W, imageAreaH);
      }
    } catch {
      drawImagePlaceholder(doc, 0, 0, PAGE_W, imageAreaH);
    }
  } else {
    drawImagePlaceholder(doc, 0, 0, PAGE_W, imageAreaH);
  }

  // Gold rule separating image from text
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.line(0, imageAreaH, PAGE_W, imageAreaH);

  // ── Text area (bottom 30%) ───────────────────────────────────────────────
  // Cream background for text
  doc.setFillColor(...CREAM);
  doc.rect(0, textAreaY, PAGE_W, textAreaH, "F");

  // Gold top border
  doc.setFillColor(...GOLD);
  doc.rect(0, textAreaY, PAGE_W, 2, "F");

  // Page title — skip generic labels
  const skipTitles = ["Title Page", "The Dragon Quest", "The Rescue Mission", "The Lost Crown", "The Forest Guardian", "The Kindness Quest", "The Light Treasure"];
  const displayTitle = skipTitles.includes(page.title) ? "" : page.title;
  
  if (displayTitle) {
    doc.setTextColor(...GOLD);
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.text(displayTitle, PAGE_W / 2, textAreaY + 22, { align: "center", maxWidth: PAGE_W - MARGIN * 2 });
  }

  // Page subtitle (set name)
  if (page.photoSet) {
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...GOLD_DARK);
    doc.text(page.photoSet, MARGIN + 12, textAreaY + 52, { maxWidth: PAGE_W - MARGIN * 2 });
  }

  // Story text in royal blue - fit within available space
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...ROYAL_BLUE);
  const allLines = doc.splitTextToSize(page.text, PAGE_W - MARGIN * 2.5);
  const textStartY = textAreaY + (displayTitle ? (page.photoSet ? 55 : 46) : (page.photoSet ? 44 : 32));
  const maxTextH = PAGE_H - textStartY - 28; // leave room for footer
  const lineH = 14;
  const maxLines = Math.floor(maxTextH / lineH);
  const textLines = allLines.slice(0, maxLines);
  doc.text(textLines, MARGIN * 1.25, textStartY, { maxWidth: PAGE_W - MARGIN * 2.5 });

  // ── Footer — just page number, elegant ──────────────────────────────────
  const footerY = PAGE_H - 14;
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...GOLD_DARK);
  doc.text(`${pageNum}`, PAGE_W / 2, footerY, { align: "center" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Back Cover
// ─────────────────────────────────────────────────────────────────────────────
function drawBackCover(doc: jsPDF): void {
  // Full-page royal blue background
  doc.setFillColor(...ROYAL_BLUE);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Decorative borders
  drawGoldBorder(doc, 24, 24, PAGE_W - 48, PAGE_H - 48);
  drawGoldBorder(doc, 32, 32, PAGE_W - 64, PAGE_H - 64, 0.5);

  // Brand logo text
  doc.setTextColor(...GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.text("Storybook Photos", PAGE_W / 2, 180, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.setTextColor(...GOLD_DARK);
  doc.text("Kingdom Quests", PAGE_W / 2, 208, { align: "center" });

  // Crown centered
  drawCrown(doc, PAGE_W / 2, 310, 55, GOLD);

  // Star row
  drawStar(doc, PAGE_W / 2 - 80, 260, 6, GOLD_DARK);
  drawStar(doc, PAGE_W / 2,       255, 8, GOLD);
  drawStar(doc, PAGE_W / 2 + 80, 260, 6, GOLD_DARK);

  // Tagline
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(...GOLD);
  const tagline = "Turn Your Child Into Royalty —";
  const tagline2 = "With a Kingdom Chronicles";
  doc.text(tagline,  PAGE_W / 2, 390, { align: "center" });
  doc.text(tagline2, PAGE_W / 2, 413, { align: "center" });

  // Divider
  doc.setDrawColor(...GOLD_DARK);
  doc.setLineWidth(0.75);
  doc.line(PAGE_W / 2 - 100, 432, PAGE_W / 2 + 100, 432);

  // Contact info
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...GOLD_DARK);
  doc.text("storybookphotos.com", PAGE_W / 2, 458, { align: "center" });
  // removed Costa Mesa

  // Footer accent bar
  doc.setFillColor(...GOLD);
  doc.rect(0, PAGE_H - 60, PAGE_W, 60, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ROYAL_BLUE);
  doc.text("© Storybook Photos  |  All Rights Reserved", PAGE_W / 2, PAGE_H - 30, { align: "center" });

  // Corner star accents
  drawStar(doc, 70, 700, 5, GOLD_DARK);
  drawStar(doc, PAGE_W - 70, 700, 5, GOLD_DARK);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────

function drawGoldBorder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  lw = 1.5
): void {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(lw);
  doc.rect(x, y, w, h, "S");
}

function drawCrown(
  doc: jsPDF,
  cx: number,
  cy: number,
  size: number,
  color: [number, number, number]
): void {
  // Simple crown: base bar + three points + jewel dots
  const halfW = size;
  const baseY  = cy + size * 0.25;
  const baseH  = size * 0.35;

  doc.setFillColor(...color);
  // Base rectangle
  doc.rect(cx - halfW, baseY, halfW * 2, baseH, "F");

  // Left point
  doc.triangle(
    cx - halfW,     baseY,
    cx - halfW * 0.6, baseY,
    cx - halfW * 0.8, cy - size * 0.55,
    "F"
  );

  // Middle point (tallest)
  doc.triangle(
    cx - halfW * 0.25, baseY,
    cx + halfW * 0.25, baseY,
    cx,                cy - size * 0.9,
    "F"
  );

  // Right point
  doc.triangle(
    cx + halfW * 0.6, baseY,
    cx + halfW,       baseY,
    cx + halfW * 0.8, cy - size * 0.55,
    "F"
  );

  // Jewel dots on crown
  doc.setFillColor(...ROYAL_BLUE);
  doc.circle(cx - halfW * 0.5, baseY + baseH * 0.45, 4, "F");
  doc.circle(cx,               baseY + baseH * 0.45, 4, "F");
  doc.circle(cx + halfW * 0.5, baseY + baseH * 0.45, 4, "F");
}

function drawStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  color: [number, number, number]
): void {
  const points = 5;
  const innerR = r * 0.4;
  doc.setFillColor(...color);

  const coords: number[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerR;
    coords.push(cx + radius * Math.cos(angle));
    coords.push(cy + radius * Math.sin(angle));
  }

  // Build path manually using jsPDF internal calls
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internal = (doc as any).internal;
  const k = internal.scaleFactor;

  internal.out(
    [
      coords[0] * k, (PAGE_H - coords[1]) * k,
      "m",
      ...coords
        .slice(2)
        .reduce((acc: string[], v: number, i: number) => {
          acc.push(String((i % 2 === 0 ? v : PAGE_H - v) * k));
          if (i % 2 === 1) acc.push("l");
          return acc;
        }, []),
      "f",
    ].join(" ")
  );
}

function drawImagePlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  doc.setFillColor(220, 215, 205);
  doc.rect(x, y, w, h, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(160, 150, 135);
  doc.text("[ Illustration ]", x + w / 2, y + h / 2, { align: "center" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Image fetch — browser + Node compatible
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Center-crop an image to a target aspect ratio using canvas (browser only).
 * Falls back to the original data URL in Node/SSR environments.
 */
async function centerCropImage(dataUrl: string, targetRatio: number): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return dataUrl; // Node.js environment — skip crop
  }
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const srcRatio = srcW / srcH;

    let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;

    if (srcRatio > targetRatio) {
      // Wider than target — crop width
      cropW = Math.round(srcH * targetRatio);
      cropX = Math.round((srcW - cropW) / 2);
    } else if (srcRatio < targetRatio) {
      // Taller than target — crop height
      cropH = Math.round(srcW / targetRatio);
      cropY = 0; // Crop from top
    }

    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return dataUrl;
  }
}

async function fetchImageAsDataUrl(
  url: string
): Promise<{ dataUrl: string; format: "JPEG" | "PNG" } | null> {
  if (url.startsWith("data:")) {
    return {
      dataUrl: url,
      format: url.includes("image/png") ? "PNG" : "JPEG",
    };
  }

  try {
    // Use server-side proxy to avoid CORS issues with CDN images
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.dataUrl) return null;

    const contentType: string = data.contentType ?? "image/jpeg";
    const format: "JPEG" | "PNG" = contentType.includes("png") ? "PNG" : "JPEG";
    return { dataUrl: data.dataUrl, format };
  } catch {
    // Fallback: direct fetch
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      if (contentType.includes("webp") || contentType.includes("avif")) return null;
      const arrayBuffer = await res.arrayBuffer();
      const b64 = arrayBufferToBase64(arrayBuffer);
      const dataUrl = `data:${contentType};base64,${b64}`;
      const format: "JPEG" | "PNG" = contentType.includes("png") ? "PNG" : "JPEG";
      return { dataUrl, format };
    } catch {
      return null;
    }
  }
}

/** Convert ArrayBuffer → base64 string in both browser and Node environments */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // Node.js path
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  // Browser path
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
