import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import {
  buildNarrationScript,
  generateNarrationAudio,
} from "@/lib/storybook/narration";
import type { StoryGender, StoryPage } from "@/lib/storybook/types";
import { TITLE_ROLE } from "@/lib/storybook/adventure-paths";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";

export const maxDuration = 120;

type Params = { params: Promise<{ id: string }> };

/**
 * Generate bedtime-story narration for a book (ElevenLabs).
 * Admin-only for now — staff can trigger from generator / video queue.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { id } = await params;

  if (!hasRealSupabase() || id.startsWith("local-")) {
    return NextResponse.json(
      { error: "Book must be saved in Supabase to attach narration" },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceClient();
    const { data: book, error } = await supabase
      .from("storybooks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const pages = (book.pages ?? []) as StoryPage[];
    const gender = (book.gender === "boy" ? "boy" : "girl") as StoryGender;
    const role = TITLE_ROLE[gender];
    const script = buildNarrationScript(book.child_name, role, pages);

    const audio = await generateNarrationAudio({
      text: script,
      filename: `${book.child_name}-narration.mp3`,
    });

    if (!audio.audioUrl) {
      return NextResponse.json(
        {
          error: audio.error || "Narration generation failed",
          script,
          hint: "Add ELEVENLABS_API_KEY (and optional ELEVENLABS_VOICE_ID) in Vercel env",
        },
        { status: 502 }
      );
    }

    let publicUrl = audio.audioUrl;

    // Upload data URL to Supabase storage when possible
    if (audio.audioUrl.startsWith("data:audio")) {
      const base64 = audio.audioUrl.split(",")[1] ?? "";
      const bytes = Buffer.from(base64, "base64");
      const path = `narration/${id}-${Date.now()}.mp3`;
      const { error: upErr } = await supabase.storage
        .from("storybook-assets")
        .upload(path, bytes, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (!upErr) {
        const { data: pub } = supabase.storage
          .from("storybook-assets")
          .getPublicUrl(path);
        publicUrl = pub.publicUrl;
      }
    }

    const { data: updated, error: updErr } = await supabase
      .from("storybooks")
      .update({
        narration_url: publicUrl,
        narration_script: script,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, narration_url, child_name")
      .single();

    if (updErr) {
      // Column may not exist yet — still return audio
      console.warn("narration column update failed:", updErr.message);
      return NextResponse.json({
        id,
        narration_url: publicUrl,
        script,
        persisted: false,
        warning: updErr.message,
      });
    }

    return NextResponse.json({
      ...updated,
      script,
      provider: audio.provider,
      persisted: true,
    });
  } catch (err) {
    console.error("Narrate error:", err);
    return NextResponse.json(
      { error: "Failed to generate narration" },
      { status: 500 }
    );
  }
}
