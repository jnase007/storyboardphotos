import { NextRequest, NextResponse } from "next/server";
import { aiGenerateSchema } from "@/lib/validations";
import { generateKingdomImage, uploadToStorage } from "@/lib/ai/generate-image";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt, style_preset } = parsed.data;

    const result = await generateKingdomImage({
      prompt,
      stylePreset: style_preset,
    });

    let finalUrl = result.imageUrl;
    let storagePath: string | null = null;

    if (hasRealSupabase()) {
      const supabase = createServiceClient();
      const filename = `${Date.now()}-${style_preset}.webp`;
      const upload = await uploadToStorage(supabase, result.imageUrl, filename);

      if (upload) {
        finalUrl = upload.publicUrl;
        storagePath = upload.storagePath;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await supabase.from("generated_images").insert({
          prompt,
          style_preset,
          image_url: finalUrl,
          storage_path: storagePath,
          expires_at: expiresAt.toISOString(),
        });
      }
    }

    return NextResponse.json({
      imageUrl: finalUrl,
      provider: result.provider,
      style_preset,
    });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    );
  }
}
