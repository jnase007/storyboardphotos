import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { createStorybookSchema } from "@/lib/storybook/validations";
import { generateKingdomStory } from "@/lib/storybook/generate-story";
import { illustrateStoryPages } from "@/lib/storybook/generate-illustrations";
import {
  generateLockedCharacterCard,
  generateShirtMockupForBook,
  pickHeroPageImage,
} from "@/lib/storybook/generate-shirt";
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

  let storybookId: string | null = null;

  try {
    const body = await request.json();
    const parsed = createStorybookSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldMsg = Object.entries(flat.fieldErrors)
        .map(([k, v]) => `${k}: ${(v as string[] | undefined)?.join(", ") || "invalid"}`)
        .slice(0, 4)
        .join(" · ");
      return NextResponse.json(
        {
          error: fieldMsg || flat.formErrors[0] || "Invalid request",
          details: flat,
        },
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
      package: outputPackage,
    } = parsed.data;

    // Face photo drives likeness. Studio set photos are not used as page art.
    const flatUrls =
      photo_urls ??
      (photos_by_set ? Object.values(photos_by_set).flat() : []);

    if (!character_photo) {
      return NextResponse.json(
        { error: "Child face / profile photo is required" },
        { status: 400 }
      );
    }

    const wantsMovie =
      outputPackage === "movie" || outputPackage === "both";

    if (hasRealSupabase()) {
      const supabase = createServiceClient();
      const baseInsert = {
        child_name,
        child_age,
        gender,
        notes: notes
          ? `[Adventure: ${adventure_path}] [Package: ${outputPackage}] ${notes}`
          : `[Adventure: ${adventure_path}] [Package: ${outputPackage}]`,
        photo_urls: flatUrls,
        status: "generating" as const,
        pages: [] as StoryPage[],
      };

      // Movie / Both → queue animated production immediately
      const withMovie = wantsMovie
        ? {
            ...baseInsert,
            video_status: "requested",
            video_package: "full",
            video_requested_at: new Date().toISOString(),
            video_notes: `Requested with generate package=${outputPackage}`,
          }
        : baseInsert;

      const { data, error } = await supabase
        .from("storybooks")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(withMovie as any)
        .select("id")
        .single();

      if (error) {
        console.error("storybooks insert:", error);
        // Retry without video columns if schema cache lag / missing cols
        const retry = await supabase
          .from("storybooks")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(baseInsert as any)
          .select("id")
          .single();
        if (!retry.error) storybookId = retry.data.id;
        else console.error("storybooks insert retry:", retry.error);
      } else {
        storybookId = data.id;
      }
    }

    const story = await generateKingdomStory({
      childName: child_name,
      childAge: child_age,
      gender,
      notes: notes ?? undefined,
      pageCount: 14,
      adventurePath: adventure_path,
      // Server resolves full path if client script is partial / passthrough
      adventureScript: adventure_script as never,
      storyMode: story_mode,
    });

    const pages: StoryPage[] = await illustrateStoryPages({
      pages: story.pages,
      photoUrls: flatUrls,
      photosBySet: photos_by_set,
      characterPhoto: character_photo ?? undefined,
      gender,
      questId: adventure_path,
    });

    let shirtMockupUrl: string | null = null;
    let finalNotes: string | null = notes ?? null;

    if (storybookId && hasRealSupabase()) {
      const supabase = createServiceClient();
      // Persist quest title in notes so cover/UI can recover it without a schema migration
      const titleTag = `[BookTitle: ${story.bookTitle}]`;
      let notesWithTitle = notes
        ? `${titleTag} [Adventure: ${adventure_path}] [Package: ${outputPackage}] ${notes}`
        : `${titleTag} [Adventure: ${adventure_path}] [Package: ${outputPackage}]`;

      // 1) Locked solo character card from face photo + best page (ONE kid only).
      // 2) Shirt uses that cutout on a blank white tee — never multi-kid scene art.
      let characterCardUrl: string | null = null;
      let characterCutoutUrl: string | null = null;
      try {
        const card = await generateLockedCharacterCard({
          bookId: storybookId,
          childName: child_name,
          gender,
          characterPhotoUrl: character_photo ?? null,
          referencePageUrl: pickHeroPageImage(pages),
          notes: notesWithTitle,
        });
        notesWithTitle = card.notes;
        characterCardUrl = card.characterCardUrl;
        characterCutoutUrl = card.cutoutUrl;
      } catch (cardErr) {
        console.warn("character card after book generate failed:", cardErr);
      }

      try {
        const shirt = await generateShirtMockupForBook({
          bookId: storybookId,
          childName: child_name,
          gender,
          pages,
          notes: notesWithTitle,
          characterCardUrl,
          characterCutoutUrl,
          characterPhotoUrl: character_photo ?? null,
        });
        notesWithTitle = shirt.notes;
        shirtMockupUrl = shirt.mockupUrl;
      } catch (shirtErr) {
        console.warn("shirt mockup after book generate failed:", shirtErr);
      }

      finalNotes = notesWithTitle;

      await supabase
        .from("storybooks")
        .update({
          pages,
          notes: notesWithTitle,
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
      notes: finalNotes,
      adventure_path: story.adventurePath,
      story_mode,
      package: outputPackage,
      video_status: wantsMovie ? "requested" : "none",
      photo_urls: flatUrls,
      photos_by_set: photos_by_set ?? null,
      pages,
      status: "ready",
      storyProvider: story.provider,
      shirt_mockup_url: shirtMockupUrl,
    });
  } catch (err) {
    console.error("Generate storybook error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate storybook";

    // If we already created a row, mark it error so Books Library doesn't look stuck forever.
    if (typeof storybookId === "string" && storybookId && hasRealSupabase()) {
      try {
        const supabase = createServiceClient();
        await supabase
          .from("storybooks")
          .update({
            status: "error",
            error_message: message.slice(0, 500),
            updated_at: new Date().toISOString(),
          })
          .eq("id", storybookId);
      } catch (markErr) {
        console.error("Failed to mark storybook error:", markErr);
      }
    }

    return NextResponse.json(
      { error: message.slice(0, 300) || "Failed to generate storybook" },
      { status: 500 }
    );
  }
}
