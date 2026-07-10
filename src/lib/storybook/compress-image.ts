/**
 * Compress/resize an image in the browser before upload.
 * Keeps payloads under Vercel’s request size limit (and inline fallback).
 */
export async function compressImageFile(
  file: File,
  options?: { maxEdge?: number; quality?: number }
): Promise<File> {
  const maxEdge = options?.maxEdge ?? 1280;
  const quality = options?.quality ?? 0.65;

  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  // Already small enough and not oversized dimensions
  if (file.size < 220_000 && scale === 1) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
}

/** Parse API JSON safely — surfaces plain-text errors like "Request Entity Too Large". */
export async function readApiJson<T = Record<string, unknown>>(
  res: Response
): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error(res.ok ? "Empty response" : `Request failed (${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const lower = text.toLowerCase();
    if (
      res.status === 413 ||
      lower.includes("request entity too large") ||
      lower.startsWith("request en")
    ) {
      throw new Error(
        "Photos are too large for upload. Use 1–2 photos per set (we compress automatically)."
      );
    }
    throw new Error(text.slice(0, 160).trim() || `Request failed (${res.status})`);
  }
}
