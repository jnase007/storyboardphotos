import { NextRequest, NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import { buildStorybookPdf } from "@/lib/storybook/build-pdf";
import type { StoryPage } from "@/lib/storybook/types";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

export const maxDuration = 180;

const execFileAsync = promisify(execFile);

/**
 * Build Mpix-ready 8x8 JPG page pack (zip).
 * Flow: same print PDF → rasterize pages @ 300 DPI → center-crop to 2400×2400 → zip.
 */
export async function POST(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mpix-zip-"));
  try {
    const body = await request.json();
    const { bookTitle, childName, pages, coverImageUrl } = body as {
      bookTitle: string;
      childName: string;
      pages: StoryPage[];
      coverImageUrl?: string;
    };

    if (!bookTitle || !childName || !pages?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pdfBlob = await buildStorybookPdf({
      bookTitle,
      childName,
      pages,
      includeCover: true,
      includeBack: true,
      coverImageUrl,
    });
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
    const pdfPath = path.join(tmpRoot, "book.pdf");
    await fs.writeFile(pdfPath, pdfBuffer);

    const pagesDir = path.join(tmpRoot, "pages");
    await fs.mkdir(pagesDir);

    // Prefer pdftoppm (poppler); fall back to PyMuPDF
    let rasterOk = false;
    try {
      await execFileAsync(
        "pdftoppm",
        ["-jpeg", "-r", "300", "-jpegopt", "quality=95", pdfPath, path.join(pagesDir, "raw")],
        { timeout: 120_000 }
      );
      rasterOk = true;
    } catch {
      // try python fitz
      const py = `
import fitz, sys, os
pdf, out = sys.argv[1], sys.argv[2]
doc = fitz.open(pdf)
zoom = 300/72
mat = fitz.Matrix(zoom, zoom)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=mat, alpha=False)
    pix.save(os.path.join(out, f"raw-{i+1:02d}.jpg"), output="jpeg", jpg_quality=95)
`;
      const pyPath = path.join(tmpRoot, "raster.py");
      await fs.writeFile(pyPath, py);
      await execFileAsync("python3", [pyPath, pdfPath, pagesDir], { timeout: 120_000 });
      rasterOk = true;
    }

    if (!rasterOk) {
      return NextResponse.json(
        { error: "Could not rasterize PDF (need pdftoppm or PyMuPDF)" },
        { status: 500 }
      );
    }

    // Collect raw jpgs and center-crop to exact Mpix 8x8 @ 300dpi = 2400px
    const cropPy = `
import sys, os
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    import fitz
    # if no PIL, just copy
    src = Path(sys.argv[1]); dst = Path(sys.argv[2]); target = int(sys.argv[3])
    dst.mkdir(parents=True, exist_ok=True)
    files = sorted([p for p in src.iterdir() if p.suffix.lower() in {'.jpg','.jpeg'}])
    for i, p in enumerate(files, 1):
        (dst / f"page-{i:02d}.jpg").write_bytes(p.read_bytes())
    print(len(files))
    raise SystemExit(0)

src = Path(sys.argv[1]); dst = Path(sys.argv[2]); target = int(sys.argv[3])
dst.mkdir(parents=True, exist_ok=True)
files = sorted([p for p in src.iterdir() if p.suffix.lower() in {'.jpg','.jpeg'}])
for i, p in enumerate(files, 1):
    im = Image.open(p).convert('RGB')
    w, h = im.size
    side = min(w, h)
    left = (w - side)//2
    top = (h - side)//2
    im = im.crop((left, top, left+side, top+side))
    if side != target:
        im = im.resize((target, target), Image.Resampling.LANCZOS)
    out = dst / f"page-{i:02d}.jpg"
    im.save(out, 'JPEG', quality=95, dpi=(300,300))
print(len(files))
`;
    const cropPath = path.join(tmpRoot, "crop.py");
    const croppedDir = path.join(tmpRoot, "cropped");
    await fs.writeFile(cropPath, cropPy);
    await execFileAsync("python3", [cropPath, pagesDir, croppedDir, "2400"], {
      timeout: 120_000,
    });

    const zipPath = path.join(tmpRoot, "mpix.zip");
    // macOS ditto makes a clean zip; fallback to zip CLI
    try {
      await execFileAsync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", croppedDir, zipPath], {
        timeout: 60_000,
      });
      // ditto --keepParent nests folder; prefer flat zip of files
      await fs.rm(zipPath, { force: true });
    } catch {
      // ignore
    }

    // Flat zip via `zip` command
    const files = (await fs.readdir(croppedDir))
      .filter((f) => f.toLowerCase().endsWith(".jpg"))
      .sort();
    if (!files.length) {
      return NextResponse.json({ error: "No page images produced" }, { status: 500 });
    }
    await execFileAsync("zip", ["-j", "-q", zipPath, ...files], {
      cwd: croppedDir,
      timeout: 60_000,
    });

    const zipBuf = await fs.readFile(zipPath);
    const safeName = String(childName || "storybook")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    return new NextResponse(zipBuf, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName}-Mpix-8x8-JPGs.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Mpix zip error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Mpix JPG zip failed",
      },
      { status: 500 }
    );
  } finally {
    try {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
