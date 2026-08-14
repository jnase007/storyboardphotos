import { NextRequest, NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import {
  generateShirtMockupForBook,
  readNoteTag,
} from "@/lib/storybook/generate-shirt";
import type { StoryPage } from "@/lib/storybook/types";

export const maxDuration = 120;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;
  if (!hasRealSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await ctx.params;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("storybooks")
    .select("id, child_name, gender, notes, pages, status")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const notes = data.notes as string | null;
  return NextResponse.json({
    id: data.id,
    child_name: data.child_name,
    gender: data.gender,
    status: data.status,
    shirt_mockup_url: readNoteTag(notes, "ShirtMockup"),
    shirt_cutout_url: readNoteTag(notes, "ShirtCutout"),
    shirt_source_url: readNoteTag(notes, "ShirtSource"),
    has_pages: Array.isArray(data.pages) && (data.pages as StoryPage[]).length > 0,
  });
}

/**
 * Generate (or regenerate) a per-book white tee mockup from this book's hero art.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;
  if (!hasRealSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const force = Boolean(body?.force);
  const overrideMockupUrl =
    typeof body?.mockupUrl === "string" && body.mockupUrl.startsWith("http")
      ? body.mockupUrl.trim()
      : null;
  const overrideCutoutUrl =
    typeof body?.cutoutUrl === "string" && body.cutoutUrl.startsWith("http")
      ? body.cutoutUrl.trim()
      : null;
  const overrideSourceUrl =
    typeof body?.sourceUrl === "string" && body.sourceUrl.startsWith("http")
      ? body.sourceUrl.trim()
      : null;
  const overridePrintfulUrl =
    typeof body?.printfulUrl === "string" && body.printfulUrl.startsWith("http")
      ? body.printfulUrl.trim()
      : null;

  const supabase = createServiceClient();
  const { data: book, error } = await supabase
    .from("storybooks")
    .select("id, child_name, gender, notes, pages")
    .eq("id", id)
    .single();

  if (error || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Admin can pin a prebuilt solo cutout mockup without regenerating from a full scene.
  if (overrideMockupUrl) {
    let notes = (book.notes as string | null) || "";
    const upsert = (tag: string, value: string) => {
      notes = notes.replace(new RegExp(`\\[${tag}:[^\\]]*\\]`, "g"), "").trim();
      notes = `[${tag}: ${value}] ${notes}`.trim();
    };
    upsert("ShirtMockup", overrideMockupUrl);
    if (overrideCutoutUrl) upsert("ShirtCutout", overrideCutoutUrl);
    if (overrideSourceUrl) upsert("ShirtSource", overrideSourceUrl);
    if (overridePrintfulUrl) upsert("ShirtPrintful", overridePrintfulUrl);

    await supabase
      .from("storybooks")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      id,
      reused: false,
      shirt_mockup_url: overrideMockupUrl,
      shirt_cutout_url: overrideCutoutUrl,
      shirt_source_url: overrideSourceUrl,
      shirt_printful_url: overridePrintfulUrl,
      provider: "admin-override",
      message: "Pinned prebuilt shirt mockup",
    });
  }

  const existing = readNoteTag(book.notes as string | null, "ShirtMockup");
  if (existing && !force) {
    return NextResponse.json({
      id,
      reused: true,
      shirt_mockup_url: existing,
      shirt_cutout_url: readNoteTag(book.notes as string | null, "ShirtCutout"),
      shirt_source_url: readNoteTag(book.notes as string | null, "ShirtSource"),
      message: "Shirt mockup already exists (pass force:true to regenerate)",
    });
  }

  const pages = (book.pages || []) as StoryPage[];
  if (!pages.some((p) => typeof p?.imageUrl === "string" && p.imageUrl.startsWith("http"))) {
    return NextResponse.json(
      { error: "Book has no illustrated pages yet" },
      { status: 400 }
    );
  }

  try {
    const result = await generateShirtMockupForBook({
      bookId: id,
      childName: book.child_name || "Hero",
      gender: book.gender,
      pages,
      notes: book.notes as string | null,
    });

    await supabase
      .from("storybooks")
      .update({
        notes: result.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      id,
      reused: false,
      shirt_mockup_url: result.mockupUrl,
      shirt_cutout_url: result.cutoutUrl,
      shirt_source_url: result.sourcePageImageUrl,
      provider: result.provider,
      message: "Per-book shirt mockup ready",
    });
  } catch (err) {
    console.error("shirt generate error", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message.slice(0, 240) : "Shirt generation failed",
      },
      { status: 500 }
    );
  }
}
