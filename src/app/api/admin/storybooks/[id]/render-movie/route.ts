import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import {
  persistMovieToStorage,
  renderPremiumStoryMovie,
} from "@/lib/storybook/render-movie";
import type { StoryPage } from "@/lib/storybook/types";
import {
  buildNarrationScript,
  generateNarrationAudio,
} from "@/lib/storybook/narration";
import { TITLE_ROLE } from "@/lib/storybook/adventure-paths";

export const maxDuration = 800;

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  package: z.enum(["teaser", "full"]).default("full"),
  force: z.boolean().optional(),
  generateNarrationIfMissing: z.boolean().optional().default(true),
});

/**
 * Admin: render a real downloadable premium MP4
 * (Seedance motion per page → stitch → ElevenLabs narration).
 */
export async function POST(request: NextRequest, { params }: Params) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { id } = await params;

  if (!hasRealSupabase() || id.startsWith("local-")) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: book, error } = await supabase
      .from("storybooks")
      .select(
        "id, child_name, gender, pages, narration_url, narration_script, video_url, video_status, video_package"
      )
      .eq("id", id)
      .single();

    if (error || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.video_url && !parsed.data.force) {
      return NextResponse.json({
        id: book.id,
        video_url: book.video_url,
        video_status: book.video_status || "ready",
        message: "Movie already ready (pass force:true to re-render)",
        reused: true,
      });
    }

    const pages = (book.pages || []) as StoryPage[];
    if (!pages.some((p) => p?.imageUrl)) {
      return NextResponse.json(
        { error: "Book has no illustrated pages to animate" },
        { status: 400 }
      );
    }

    // Mark in production early so UI reflects work
    await supabase
      .from("storybooks")
      .update({
        video_status: "in_production",
        video_package: parsed.data.package,
        video_notes: "Premium Seedance render started…",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    let narrationUrl = book.narration_url as string | null;

    if (!narrationUrl && parsed.data.generateNarrationIfMissing) {
      const gender = (book.gender === "girl" ? "girl" : "boy") as "boy" | "girl";
      const role = TITLE_ROLE[gender];
      const script =
        (book.narration_script as string) ||
        buildNarrationScript(book.child_name, role, pages);
      const audio = await generateNarrationAudio({
        text: script,
        filename: `${book.child_name}-narration.mp3`,
      });
      if (audio.audioUrl) {
        narrationUrl = audio.audioUrl;
        if (audio.audioUrl.startsWith("data:audio")) {
          const base64 = audio.audioUrl.split(",")[1] ?? "";
          const bytes = Buffer.from(base64, "base64");
          const path = `narration/${id}-${Date.now()}.mp3`;
          const { error: upErr } = await supabase.storage
            .from("storybook-assets")
            .upload(path, bytes, { contentType: "audio/mpeg", upsert: true });
          if (!upErr) {
            const { data: pub } = supabase.storage
              .from("storybook-assets")
              .getPublicUrl(path);
            narrationUrl = pub.publicUrl;
          }
        }
        await supabase
          .from("storybooks")
          .update({
            narration_url: narrationUrl,
            narration_script: script,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    }

    const coverImageUrl =
      pages.find((p) => p.imageUrl)?.imageUrl ?? null;

    const rendered = await renderPremiumStoryMovie({
      childName: book.child_name,
      gender: book.gender,
      pages,
      narrationUrl,
      package: parsed.data.package,
      coverImageUrl,
    });

    const publicUrl = await persistMovieToStorage({
      supabase,
      bookId: id,
      videoUrl: rendered.videoUrl,
    });

    const now = new Date().toISOString();
    const notes = [
      `Premium render ${rendered.provider}`,
      `${rendered.pagesUsed} pages animated`,
      ...rendered.notes.slice(0, 12),
    ].join("\n");

    const { data: updated, error: updErr } = await supabase
      .from("storybooks")
      .update({
        video_url: publicUrl,
        video_status: "ready",
        video_package: parsed.data.package,
        video_notes: notes,
        video_delivered_at: now,
        updated_at: now,
      })
      .eq("id", id)
      .select(
        "id, child_name, video_status, video_url, video_package, video_notes, narration_url"
      )
      .single();

    if (updErr) {
      return NextResponse.json({
        id,
        video_url: publicUrl,
        video_status: "ready",
        clip_count: rendered.clipUrls.length,
        notes: rendered.notes,
        persisted: false,
        warning: updErr.message,
      });
    }

    return NextResponse.json({
      ...updated,
      clip_count: rendered.clipUrls.length,
      pages_used: rendered.pagesUsed,
      provider: rendered.provider,
      notes: rendered.notes,
      message: "Premium MP4 ready — parents can Watch / Download movie",
    });
  } catch (err) {
    console.error("render-movie error:", err);
    const message = err instanceof Error ? err.message : "Render failed";

    try {
      const supabase = createServiceClient();
      await supabase
        .from("storybooks")
        .update({
          video_status: "requested",
          video_notes: `Render failed: ${message.slice(0, 500)}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch {
      /* ignore */
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
