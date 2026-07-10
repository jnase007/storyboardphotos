import { NextRequest, NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import { generateStoryIllustration } from "@/lib/storybook/generate-illustrations";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { imagePrompt, pageTitle } = body;

    const prompt = imagePrompt || pageTitle || "An enchanted kingdom watercolor scene";

    const result = await generateStoryIllustration({
      prompt,
      referenceImageUrl: null,
    });

    return NextResponse.json({
      imageUrl: result.imageUrl,
      provider: result.provider,
    });
  } catch (err) {
    console.error("Regenerate page error:", err);
    return NextResponse.json({ error: "Failed to regenerate page" }, { status: 500 });
  }
}
