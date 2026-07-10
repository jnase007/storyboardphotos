import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { createStorybookSchema } from "@/lib/storybook/validations";
import { generateKingdomStory } from "@/lib/storybook/generate-story";
import { illustrateStoryPages } from "@/lib/storybook/generate-illustrations";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import type { StoryPage } from "@/lib/storybook/types";

export const maxDuration = 300;

/**
 * Create a storybook project and generate story + illustrations.
 */
export async function POST(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = createStorybookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      child_name,
      child_age,
      gender,
      notes,
      photos_by_set,
      photo_urls,
      adventure_path,
      story_mode,
      adventure_script,
      character_photo,
    } = parsed.data;

    const flatUrls =
      photo_urls ??
      (photos_by_set
        ? Object.values(photos_by_set).flat()
        : []);

    let storybookId: string | null = null;

    if (hasRealSupabase()) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("storybooks")
        .insert({
          child_name,
          child_age,
          gender,
          notes: notes
            ? `[Adventure: ${adventure_path}] ${notes}`
            : `[Adventure: ${adventure_path}]`,
          photo_urls: flatUrls,
          status: "generating",
          pages: [],
        })
        .select("id")
        .single();

      if (error) {
        console.error("storybooks insert:", error);
        // Continue without DB if table missing — still return generated book
      } else {
        storybookId = data.id;
      }
    }

    const story = await generateKingdomStory({
      childName: child_name,
      childAge: child_age,
      gender,
      notes: notes ?? undefined,
      pageCount: 10,
      adventurePath: adventure_path,
      adventureScript: adventure_script,
      storyMode: story_mode,
    });

    const pages: StoryPage[] = await illustrateStoryPages({
      pages: story.pages,
      photoUrls: flatUrls,
      photosBySet: photos_by_set,
      characterPhoto: character_photo ?? undefined,
    });

    if (storybookId && hasRealSupabase()) {
      const supabase = createServiceClient();
      await supabase
        .from("storybooks")
        .update({
          pages,
          status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", storybookId);
    }

    return NextResponse.json({
      id: storybookId ?? `local-${Date.now()}`,
      bookTitle: story.bookTitle,
      child_name,
      child_age,
      gender,
      notes: notes ?? null,
      adventure_path: story.adventurePath,
      story_mode,
      photo_urls: flatUrls,
      photos_by_set: photos_by_set ?? null,
      pages,
      status: "ready",
      storyProvider: story.provider,
    });
  } catch (err) {
    console.error("Generate storybook error:", err);
    return NextResponse.json(
      { error: "Failed to generate storybook" },
      { status: 500 }
    );
  }
}
