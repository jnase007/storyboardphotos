import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

const requestSchema = z.object({
  package: z.enum(["teaser", "full"]).default("full"),
  contact_name: z.string().max(120).optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

const adminUpdateSchema = z.object({
  video_status: z
    .enum([
      "none",
      "requested",
      "paid",
      "in_production",
      "ready",
      "delivered",
      "cancelled",
    ])
    .optional(),
  video_url: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  video_package: z.enum(["teaser", "full"]).optional().nullable(),
  video_notes: z.string().max(2000).optional().nullable(),
});

/**
 * Public: request animated movie (ListedFire-style production queue).
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!hasRealSupabase() || id.startsWith("local-")) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: book, error } = await supabase
      .from("storybooks")
      .select("id, child_name, video_status, video_url")
      .eq("id", id)
      .single();

    if (error || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.video_url) {
      return NextResponse.json({
        id: book.id,
        video_status: "ready",
        video_url: book.video_url,
        message: "Movie already ready",
      });
    }

    const now = new Date().toISOString();
    const { data, error: updErr } = await supabase
      .from("storybooks")
      .update({
        video_status: "requested",
        video_package: parsed.data.package,
        video_contact_name: parsed.data.contact_name ?? null,
        video_contact_email: parsed.data.contact_email ?? null,
        video_notes: parsed.data.notes ?? null,
        video_requested_at: now,
        updated_at: now,
      })
      .eq("id", id)
      .select(
        "id, child_name, video_status, video_package, video_requested_at"
      )
      .single();

    if (updErr) {
      console.error("video request update:", updErr);
      return NextResponse.json(
        {
          error:
            "Could not save video request. Run supabase/animated-videos.sql in Supabase.",
          detail: updErr.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...data,
      message:
        "Movie requested! Our team will create the animated storybook reading (48–72 hrs).",
    });
  } catch (err) {
    console.error("Video request error:", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

/**
 * Admin: update video status / deliver final MP4 URL.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { id } = await params;

  if (!hasRealSupabase()) {
    return NextResponse.json({ error: "Supabase required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = adminUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const patch: {
      updated_at: string;
      video_status?: string;
      video_url?: string | null;
      video_package?: string | null;
      video_notes?: string | null;
      video_delivered_at?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.video_status !== undefined) {
      patch.video_status = parsed.data.video_status;
    }
    if (parsed.data.video_url !== undefined) {
      patch.video_url = parsed.data.video_url;
    }
    if (parsed.data.video_package !== undefined) {
      patch.video_package = parsed.data.video_package;
    }
    if (parsed.data.video_notes !== undefined) {
      patch.video_notes = parsed.data.video_notes;
    }

    if (
      parsed.data.video_status === "ready" ||
      parsed.data.video_status === "delivered" ||
      parsed.data.video_url
    ) {
      patch.video_delivered_at = new Date().toISOString();
      if (!parsed.data.video_status && parsed.data.video_url) {
        patch.video_status = "ready";
      }
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("storybooks")
      .update(patch)
      .eq("id", id)
      .select(
        "id, child_name, video_status, video_url, video_package, video_notes, narration_url"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Video patch error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/** Public: get video + narration status for a book */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!hasRealSupabase()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("storybooks")
    .select(
      "id, child_name, video_status, video_url, video_package, narration_url, video_notes"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Domino's-style tracker (parsed from video_notes when present)
  let tracker: unknown = null;
  try {
    const { parseMovieTracker } = await import(
      "@/lib/storybook/movie-tracker"
    );
    tracker = parseMovieTracker(data.video_notes);
  } catch {
    tracker = null;
  }

  return NextResponse.json({ ...data, tracker });
}
