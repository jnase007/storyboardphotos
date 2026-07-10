import { jsPDF } from "jspdf";
import type { StoryPage } from "./types";

/**
 * Build a simple multi-page PDF of the storybook for printer handoff.
 * Images are embedded when reachable; text always prints.
 */
export async function buildStorybookPdf(options: {
  bookTitle: string;
  childName: string;
  pages: StoryPage[];
}): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;

  for (let i = 0; i < options.pages.length; i++) {
    if (i > 0) doc.addPage();
    const page = options.pages[i];

    // Header bar
    doc.setFillColor(30, 51, 82); // royal blue
    doc.rect(0, 0, pageW, 56, "F");
    doc.setTextColor(212, 176, 122); // gold
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(options.bookTitle, margin, 34, { maxWidth: pageW - margin * 2 });

    doc.setTextColor(30, 51, 82);
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text(`Page ${page.page} — ${page.title}`, margin, 88);

    let textTop = 112;

    if (page.imageUrl && !page.imageUrl.includes("placehold.co")) {
      try {
        const img = await fetchImageAsDataUrl(page.imageUrl);
        if (img) {
          const imgW = pageW - margin * 2;
          const imgH = 260;
          doc.addImage(img.dataUrl, img.format, margin, textTop, imgW, imgH);
          textTop += imgH + 24;
        }
      } catch {
        /* skip image */
      }
    }

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(40, 50, 70);
    const lines = doc.splitTextToSize(page.text, pageW - margin * 2);
    doc.text(lines, margin, textTop);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 140, 120);
    doc.text(
      `Storybook Photos · ${options.childName} · ${page.page}/${options.pages.length}`,
      pageW / 2,
      pageH - 28,
      { align: "center" }
    );
  }

  return doc.output("blob");
}

async function fetchImageAsDataUrl(
  url: string
): Promise<{ dataUrl: string; format: "JPEG" | "PNG" } | null> {
  if (url.startsWith("data:")) {
    if (url.includes("image/png")) {
      return { dataUrl: url, format: "PNG" };
    }
    return { dataUrl: url, format: "JPEG" };
  }

  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  // jsPDF reliably supports JPEG/PNG; skip exotic formats
  if (contentType.includes("webp")) return null;
  const b64 = buf.toString("base64");
  const dataUrl = `data:${contentType};base64,${b64}`;
  const format: "JPEG" | "PNG" = contentType.includes("png") ? "PNG" : "JPEG";
  return { dataUrl, format };
}
