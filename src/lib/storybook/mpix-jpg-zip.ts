/**
 * Browser-side: PDF blob → Mpix 8×8 JPG page zip (2400×2400 @ ~300 DPI).
 * Works on Vercel (no pdftoppm). Uses pdf.js + JSZip.
 */

import JSZip from "jszip";

const MPIX_PX = 2400; // 8" × 300 DPI

export async function pdfBlobToMpixJpgZip(
  pdfBlob: Blob,
  zipBaseName: string
): Promise<Blob> {
  const data = new Uint8Array(await pdfBlob.arrayBuffer());

  // pdfjs — pin worker to same package version via CDN (reliable in Next)
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const doc = await pdfjs.getDocument({ data }).promise;
  const zip = new JSZip();

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const unscaled = page.getViewport({ scale: 1 });
    // Render sharp, then fit into 2400 square
    const scale = (MPIX_PX * 1.15) / Math.min(unscaled.width, unscaled.height);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Center-crop / letterbox to exact 2400×2400
    const out = document.createElement("canvas");
    out.width = MPIX_PX;
    out.height = MPIX_PX;
    const octx = out.getContext("2d");
    if (!octx) throw new Error("Canvas not available");
    octx.fillStyle = "#F8F4EC";
    octx.fillRect(0, 0, MPIX_PX, MPIX_PX);

    const src = canvas;
    const side = Math.min(src.width, src.height);
    const sx = (src.width - side) / 2;
    const sy = (src.height - side) / 2;
    octx.drawImage(src, sx, sy, side, side, 0, 0, MPIX_PX, MPIX_PX);

    const blob: Blob = await new Promise((resolve, reject) => {
      out.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("JPEG encode failed"))),
        "image/jpeg",
        0.95
      );
    });
    zip.file(`page-${String(i).padStart(2, "0")}.jpg`, blob);
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
