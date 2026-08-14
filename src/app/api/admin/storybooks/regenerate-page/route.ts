import { NextRequest, NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import { generateStoryIllustration } from "@/lib/storybook/generate-illustrations";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import type { StoryPage } from "@/lib/storybook/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const {
      imagePrompt,
      pageTitle,
      character_photo,
      storybook_id,
      page_index,
      gender,
      quest_id,
    } = body as {
      imagePrompt?: string;
      pageTitle?: string;
      character_photo?: string | null;
      storybook_id?: string;
      page_index?: number;
      gender?: string | null;
      quest_id?: string | null;
    };

    let resolvedGender = gender ?? null;
    let resolvedQuestId = quest_id ?? null;
    // Prefer gender + adventure path stored on the book so regenerates keep locks
    if (
      hasRealSupabase() &&
      storybook_id &&
      !String(storybook_id).startsWith("local-")
    ) {
      try {
        const supabase = createServiceClient();
        const { data: row } = await supabase
          .from("storybooks")
          .select("gender, notes")
          .eq("id", storybook_id)
          .single();
        if (!resolvedGender && row?.gender) resolvedGender = String(row.gender);
        if (!resolvedQuestId && row?.notes) {
          const m = String(row.notes).match(/\[Adventure:\s*([^\]]+)\]/i);
          if (m?.[1]) resolvedQuestId = m[1].trim();
        }
      } catch {
        /* ignore */
      }
    }

    const scene = imagePrompt || pageTitle || "An enchanted kingdom watercolor scene";
    const pageHint = { title: pageTitle || "", text: "", imagePrompt: imagePrompt || "" };
    const prompt = `${scene}. ONE full-bleed 4:3 landscape watercolor children's storybook illustration only — not a diptych, not two panels, not a double-page spread. Soft sepia ink outlines, pastel watercolor washes. FILL entire canvas edge-to-edge. NO vine border, NO floral frame, NO white side margins. Full figure with headroom, never crop the head, no text, no watermark. Keep the locked QUEST COSTUME identical to the rest of the book (face photo = likeness only, ignore photo clothes). Crown on child ONLY if this is a crowning/finale page. Keep locked cast identical to the Character Bible for this quest only — full dragon ONLY on Dragon Mountain; other quests may use small cute animals, never a dragon.`;

    const result = await generateStoryIllustration({
      prompt,
      referenceImageUrl: null,
      characterPhotoUrl: character_photo ?? null,
      gender: resolvedGender,
      questId: resolvedQuestId,
      pageIndex: typeof page_index === "number" ? page_index : null,
      page: pageHint,
    });

    // Persist into storybook pages when we have an id + index
    if (
      hasRealSupabase() &&
      storybook_id &&
      typeof page_index === "number" &&
      page_index >= 0 &&
      !String(storybook_id).startsWith("local-")
    ) {
      try {
        const supabase = createServiceClient();
        const { data: row } = await supabase
          .from("storybooks")
          .select("pages")
          .eq("id", storybook_id)
          .single();
        const existing = Array.isArray(row?.pages) ? (row.pages as StoryPage[]) : [];
        if (existing[page_index]) {
          const pages: StoryPage[] = existing.map((p, i) =>
            i === page_index
              ? { ...p, imageUrl: result.imageUrl, useSessionPhoto: false }
              : p
          );
          await supabase
            .from("storybooks")
            .update({ pages, updated_at: new Date().toISOString() })
            .eq("id", storybook_id);
        }
      } catch (persistErr) {
        console.error("regenerate-page persist:", persistErr);
      }
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      provider: result.provider,
    });
  } catch (err) {
    console.error("Regenerate page error:", err);
    return NextResponse.json({ error: "Failed to regenerate page" }, { status: 500 });
  }
}
