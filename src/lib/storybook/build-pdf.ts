import { jsPDF } from "jspdf";
import type { StoryPage } from "./types";
import { stripRedundantTitlePages } from "./adventure-paths";

function isLikelyTitlePage(p: StoryPage): boolean {
  const title = (p.title || "").trim().toLowerCase();
  if (title === "title page") return true;
  const text = (p.text || "").replace(/\s+/g, " ").trim();
  return (
    text.length <= 90 &&
    /and the /i.test(text) &&
    !text.includes("\n")
  );
}

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

  // Prefer dedicated title/cover art (page 1) so interior "The Call" is never duplicated on the cover
  const titleOrFirstArt =
    pages.find((p) => isLikelyTitlePage(p))?.imageUrl ||
    pages[0]?.imageUrl ||
    undefined;
  const resolvedCoverUrl = coverImageUrl || titleOrFirstArt;

  // ── Cover page ────────────────────────────────────────────────────────────
  if (includeCover) {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    await drawCoverPageAsync(doc, childName, bookTitle, resolvedCoverUrl, bookType);
  }

  // ── Interior pages ────────────────────────────────────────────────────────
  // Drop redundant title/portrait interior page (cover already has name + hero)
  const storyPages = stripRedundantTitlePages(pages);
  const totalStoryPages = storyPages.length;
  for (let i = 0; i < storyPages.length; i++) {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    await drawInteriorPage(doc, storyPages[i], i + 1, totalStoryPages, childName, bookTitle);
  }

  // ── Back cover ────────────────────────────────────────────────────────────
  if (includeBack) {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    await drawBackCoverAsync(doc);
  }

  return doc.output("blob");
}

// ─────────────────────────────────────────────────────────────────────────────
// Cover Page
// ─────────────────────────────────────────────────────────────────────────────
/** Cover title: "Queen River and the Broken Bridge Rescue" */
function formatCoverTitleLines(
  bookTitle: string,
  childName: string,
  bookType: "chronicles" | "portraits"
): { line1: string; line2: string; line3?: string } {
  if (bookType === "portraits") {
    return { line1: `${childName}'s`, line2: "Royal Portraits" };
  }
  const clean = (bookTitle || "").replace(/\s+/g, " ").trim();
  // Prefer "Role Name and the Quest Name" split after " and "
  const m = clean.match(/^(.*?\S)\s+and\s+(the\s+)?(.+)$/i);
  if (m) {
    const hero = m[1].trim();
    const quest = `${m[2] || ""}${m[3]}`.replace(/\s+/g, " ").trim();
    // Keep "and the" on line 2 for classic storybook cadence
    return {
      line1: hero,
      line2: m[2] ? `and the` : "and",
      line3: m[2] ? m[3].trim() : quest,
    };
  }
  if (clean) {
    // Fallback: first half / second half
    const words = clean.split(" ");
    if (words.length >= 5) {
      const mid = Math.ceil(words.length / 2);
      return {
        line1: words.slice(0, mid).join(" "),
        line2: words.slice(mid).join(" "),
      };
    }
    return { line1: clean, line2: "A Kingdom Quest" };
  }
  return { line1: `${childName}'s`, line2: "Kingdom Chronicles" };
}

async function drawCoverPageAsync(
  doc: jsPDF,
  childName: string,
  bookTitle: string,
  coverImageUrl?: string,
  bookType: "chronicles" | "portraits" = "chronicles"
): Promise<void> {
  // Prefer first story page art as cover so it matches the book look
  const CHRONICLES_COVER = "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/cover-template.jpg";
  const PORTRAITS_COVER = "https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/story-scenes/portrait-album-cover.jpg";
  const COVER_URL = coverImageUrl ?? (bookType === "portraits" ? PORTRAITS_COVER : CHRONICLES_COVER);

  // Cream base (matches interior pages)
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  try {
    const img = await fetchImageAsDataUrl(COVER_URL);
    if (img) {
      // Full-bleed cover art — cover the square page without side bars
      const props = doc.getImageProperties(img.dataUrl);
      const imgRatio = props.width / props.height;
      const pageRatio = PAGE_W / PAGE_H;
      let drawW = PAGE_W;
      let drawH = PAGE_H;
      let drawX = 0;
      let drawY = 0;
      if (imgRatio > pageRatio) {
        // wider — fit height, crop sides slightly
        drawH = PAGE_H;
        drawW = PAGE_H * imgRatio;
        drawX = (PAGE_W - drawW) / 2;
      } else {
        // taller — fit width, crop top/bottom slightly (center)
        drawW = PAGE_W;
        drawH = PAGE_W / imgRatio;
        drawY = (PAGE_H - drawH) / 2;
      }
      doc.addImage(img.dataUrl, img.format, drawX, drawY, drawW, drawH, undefined, "FAST");
    } else {
      drawFallbackCover(doc);
    }
  } catch {
    drawFallbackCover(doc);
  }

  const { line1, line2, line3 } = formatCoverTitleLines(
    bookTitle,
    childName,
    bookType
  );
  const threeLine = Boolean(line3);
  // Title lives at the BOTTOM so long quest names never cover the child's face/crown.
  // No brand chip on cover — Justin: remove "Storybook Photos · Kingdom Quests" from first page.
  const plaqueH = threeLine ? PAGE_H * 0.2 : PAGE_H * 0.15;
  const plaqueY = PAGE_H - plaqueH - PAGE_H * 0.045;

  // Soft cream title plaque at BOTTOM (face-safe)
  doc.setFillColor(248, 244, 236);
  doc.setGState(doc.GState({ opacity: 0.94 }));
  doc.roundedRect(PAGE_W * 0.08, plaqueY, PAGE_W * 0.84, plaqueH, 12, 12, "F");
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.75);
  doc.roundedRect(PAGE_W * 0.08, plaqueY, PAGE_W * 0.84, plaqueH, 12, 12, "S");

  // Hero line: Queen River
  const t1 = plaqueY + plaqueH * (threeLine ? 0.32 : 0.4);
  const t2 = plaqueY + plaqueH * (threeLine ? 0.55 : 0.72);
  const t3 = plaqueY + plaqueH * 0.8;

  doc.setFont("times", "bold");
  doc.setFontSize(line1.length > 24 ? 20 : 24);
  doc.setTextColor(...ROYAL_BLUE);
  doc.text(line1, PAGE_W / 2, t1, {
    align: "center",
    maxWidth: PAGE_W * 0.76,
  });

  // and the / quest
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(...GOLD_DARK);
  doc.text(line2, PAGE_W / 2, t2, {
    align: "center",
    maxWidth: PAGE_W * 0.76,
  });

  if (line3) {
    doc.setFont("times", "bold");
    doc.setFontSize(line3.length > 30 ? 16 : 20);
    doc.setTextColor(...ROYAL_BLUE);
    doc.text(line3, PAGE_W / 2, t3, {
      align: "center",
      maxWidth: PAGE_W * 0.76,
    });
  }
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
          // Full-bleed cover fit for the image band (4:3 art → no side bars)
          if (imgRatio > areaRatio) {
            // Image wider — fit height, slight side crop
            drawH = imageAreaH;
            drawW = imageAreaH * imgRatio;
            drawX = (PAGE_W - drawW) / 2;
            drawY = 0;
          } else {
            // Image taller — fit width, slight top/bottom crop (centered)
            drawW = PAGE_W;
            drawH = PAGE_W / imgRatio;
            drawX = 0;
            drawY = (imageAreaH - drawH) / 2;
          }
          doc.setFillColor(...CREAM);
          doc.rect(0, 0, PAGE_W, imageAreaH, "F");
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

  // Page title — skip generic adventure labels + pure title pages
  const skipTitles = [
    "Title Page",
    "The Dragon Quest",
    "The Rescue Mission",
    "The Lost Crown",
    "The Forest Guardian",
    "The Kindness Quest",
    "The Light Treasure",
  ];
  // Avoid "The End" title when body already ends with The End
  let displayTitle = skipTitles.includes(page.title) ? "" : page.title;
  if (
    displayTitle &&
    /the end\.?$/i.test((page.text || "").trim()) &&
    /^the end$/i.test(displayTitle.trim())
  ) {
    displayTitle = "";
  }

  const bodyText = (page.text || "").trim();
  const charCount = bodyText.length;
  // Bigger type for short storybook pages — fill the cream band, less empty white
  let bodySize = 16;
  let lineH = 22;
  if (charCount > 520) {
    bodySize = 12.5;
    lineH = 17;
  } else if (charCount > 320) {
    bodySize = 14;
    lineH = 19;
  } else if (charCount > 180) {
    bodySize = 15.5;
    lineH = 21;
  } else {
    bodySize = 17.5;
    lineH = 24;
  }

  const titleBlockH = displayTitle ? 36 : 12;
  const textTop = textAreaY + titleBlockH;
  const footerReserve = 26;
  const maxTextH = PAGE_H - textTop - footerReserve;
  const textWidth = PAGE_W - MARGIN * 2.2;

  if (displayTitle) {
    doc.setTextColor(...GOLD_DARK);
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text(displayTitle, PAGE_W / 2, textAreaY + 26, {
      align: "center",
      maxWidth: PAGE_W - MARGIN * 2,
    });
  }

  // Story text — large, centered in the text band when short
  doc.setFont("times", "normal");
  doc.setFontSize(bodySize);
  doc.setTextColor(...ROYAL_BLUE);
  const allLines: string[] = doc.splitTextToSize(bodyText, textWidth);
  const maxLines = Math.max(1, Math.floor(maxTextH / lineH));
  const textLines = allLines.slice(0, maxLines);
  const blockH = textLines.length * lineH;
  // Vertically center short copy in the cream zone so it doesn't float at the top
  const startY =
    textLines.length * lineH < maxTextH * 0.72
      ? textTop + Math.max(8, (maxTextH - blockH) / 2)
      : textTop + 6;
  doc.text(textLines, PAGE_W / 2, startY, {
    align: "center",
    maxWidth: textWidth,
    lineHeightFactor: lineH / bodySize,
  });

  // ── Footer — page number ────────────────────────────────────────────────
  const footerY = PAGE_H - 14;
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...GOLD_DARK);
  doc.text(`${pageNum}`, PAGE_W / 2, footerY, { align: "center" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Back Cover
// ─────────────────────────────────────────────────────────────────────────────
/** Justin: replace gold castle/crown mark with Storybook Photos logo. */
const BACK_COVER_LOGO_URL =
  process.env.STORYBOOK_BACK_LOGO_URL ||
  "https://www.storybookphotos.com/brand/storybook-photos-logo-color.png";

async function drawBackCoverAsync(doc: jsPDF): Promise<void> {
  // Match interior watercolor books — cream storybook back, not corporate navy
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Soft gold double frame
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.roundedRect(28, 28, PAGE_W - 56, PAGE_H - 56, 14, 14, "S");
  doc.setLineWidth(0.75);
  doc.roundedRect(40, 40, PAGE_W - 80, PAGE_H - 80, 10, 10, "S");

  // Brand logo centered (no gold castle / crown mark)
  let logoDrawn = false;
  try {
    const logo = await fetchImageAsDataUrl(BACK_COVER_LOGO_URL);
    if (logo) {
      const logoW = 220;
      const logoH = 150;
      const logoX = (PAGE_W - logoW) / 2;
      const logoY = 95;
      doc.addImage(
        logo.dataUrl,
        logo.format,
        logoX,
        logoY,
        logoW,
        logoH,
        undefined,
        "FAST"
      );
      logoDrawn = true;
    }
  } catch {
    /* fall through to wordmark */
  }

  if (!logoDrawn) {
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...ROYAL_BLUE);
    doc.text("Storybook Photos", PAGE_W / 2, 170, { align: "center" });
  }

  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(...GOLD_DARK);
  doc.text("Kingdom Quests", PAGE_W / 2, logoDrawn ? 270 : 210, {
    align: "center",
  });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  const ruleY = logoDrawn ? 290 : 230;
  doc.line(PAGE_W * 0.28, ruleY, PAGE_W * 0.72, ruleY);

  doc.setFont("times", "italic");
  doc.setFontSize(15);
  doc.setTextColor(...ROYAL_BLUE);
  const tagY = logoDrawn ? 330 : 280;
  doc.text("Every child is the hero of their own", PAGE_W / 2, tagY, {
    align: "center",
  });
  doc.text("kingdom adventure.", PAGE_W / 2, tagY + 22, { align: "center" });

  // URL badge
  const badgeY = logoDrawn ? 390 : 360;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE_W * 0.22, badgeY, PAGE_W * 0.56, 48, 10, 10, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.roundedRect(PAGE_W * 0.22, badgeY, PAGE_W * 0.56, 48, 10, 10, "S");
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...ROYAL_BLUE);
  doc.text("storybookphotos.com", PAGE_W / 2, badgeY + 30, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD_DARK);
  doc.text("© Storybook Photos · All rights reserved", PAGE_W / 2, PAGE_H - 56, {
    align: "center",
  });
}

function drawBackCover(doc: jsPDF): void {
  // Sync stub — production path uses drawBackCoverAsync
  void doc;
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
      // Wider than target — crop sides only (keep full height / heads)
      cropW = Math.round(srcH * targetRatio);
      cropX = Math.round((srcW - cropW) / 2);
    } else if (srcRatio < targetRatio) {
      // Taller than target — center crop vertically (never chop from top only)
      cropH = Math.round(srcW / targetRatio);
      cropY = Math.round((srcH - cropH) / 2);
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
