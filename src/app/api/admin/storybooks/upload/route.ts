import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import {
  MAX_PHOTOS_PER_SET,
  SET_UPLOAD_SLOTS,
  type PhotosBySet,
  type SetUploadId,
} from "@/lib/storybook/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Cap individual upload size after client compression (bytes). */
const MAX_FILE_BYTES = 2_500_000;
/** Stricter cap when falling back to inline data URLs (no Supabase). */
const MAX_INLINE_FILE_BYTES = 450_000;

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_INLINE_FILE_BYTES) {
    throw new Error(
      `Photo "${file.name}" is too large for temporary storage (${Math.round(buffer.length / 1024)}KB). Use 1 photo per set, or add Supabase storage on Vercel.`
    );
  }
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function fileToSupabaseUrl(file: File): Promise<string> {
  const supabase = createServiceClient();
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > MAX_FILE_BYTES) {
    throw new Error(
      `Photo "${file.name}" is still too large after compression. Try a smaller image.`
    );
  }

  const { error } = await supabase.storage
    .from("storybook-assets")
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("storybook-assets").getPublicUrl(path);
  return publicUrl;
}

async function fileToUrl(file: File): Promise<string> {
  if (hasRealSupabase()) {
    return fileToSupabaseUrl(file);
  }
  // Temporary kiosk path until Supabase keys are on Vercel
  return fileToDataUrl(file);
}

/**
 * Upload session photos for one or more kingdom sets.
 * Prefer Supabase public URLs; falls back to compressed data URLs if unset.
 */
export async function POST(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const photos_by_set = {} as Partial<PhotosBySet>;
    const allUrls: string[] = [];
    let setsReceived = 0;

    for (const slot of SET_UPLOAD_SLOTS) {
      const files = form
        .getAll(slot.id)
        .filter((f): f is File => f instanceof File && f.size > 0);

      if (files.length === 0) continue;
      setsReceived += 1;

      if (files.length > MAX_PHOTOS_PER_SET) {
        return NextResponse.json(
          {
            error: `Maximum ${MAX_PHOTOS_PER_SET} photos for ${slot.name}`,
          },
          { status: 400 }
        );
      }

      const urls: string[] = [];
      for (const file of files) {
        const url = await fileToUrl(file);
        urls.push(url);
        allUrls.push(url);
      }
      photos_by_set[slot.id as SetUploadId] = urls;
    }

    if (setsReceived === 0) {
      return NextResponse.json(
        { error: "No photos received. Add at least one image." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      photos_by_set,
      photo_urls: allUrls,
      storage: hasRealSupabase() ? "supabase" : "inline",
    });
  } catch (err) {
    console.error("Photo upload error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to upload photos";
    const status =
      message.toLowerCase().includes("too large") ||
      message.toLowerCase().includes("entity")
        ? 413
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
