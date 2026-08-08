import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";

/**
 * List animated movie production jobs (ListedFire-style queue).
 */
export async function GET(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  if (!hasRealSupabase()) {
    return NextResponse.json({ jobs: [], warning: "Supabase not configured" });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("storybooks")
      .select(
        "id, child_name, child_age, gender, status, created_at, pages, video_status, video_url, video_package, video_requested_at, video_delivered_at, video_contact_name, video_contact_email, video_notes, narration_url, narration_script"
      )
      .neq("video_status", "none")
      .order("video_requested_at", { ascending: false });

    if (error) {
      // Fallback if columns missing
      return NextResponse.json({
        jobs: [],
        error: error.message,
        hint: "Run supabase/animated-videos.sql in Supabase SQL editor",
      });
    }

    const jobs = (data ?? []).map((row) => {
      const pages = (row.pages as Array<{ imageUrl?: string; text?: string }>) ?? [];
      return {
        ...row,
        page_count: pages.length,
        page_images: pages
          .map((p) => p.imageUrl)
          .filter((u): u is string => Boolean(u)),
        preview_image: pages[0]?.imageUrl ?? null,
      };
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("video-jobs list:", err);
    return NextResponse.json({ error: "Failed to list jobs" }, { status: 500 });
  }
}
