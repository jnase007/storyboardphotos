import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { buildStorybookPdf } from "@/lib/storybook/build-pdf";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import type { StoryPage } from "@/lib/storybook/types";

type Params = { params: Promise<{ id: string }> };

/**
 * Approve storybook: build PDF, optionally store in Supabase, return download.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await request.json();
    const pages = body.pages as StoryPage[] | undefined;
    const childName = (body.child_name as string) || "Child";
    const bookTitle =
      (body.bookTitle as string) ||
      `${childName} and the Kingdom Quest`;

    if (!pages?.length) {
      return NextResponse.json(
        { error: "pages are required" },
        { status: 400 }
      );
    }

    const pdfBlob = await buildStorybookPdf({
      bookTitle,
      childName,
      pages,
    });
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    let pdfUrl: string | null = null;

    if (hasRealSupabase() && !id.startsWith("local-")) {
      const supabase = createServiceClient();
      const path = `pdfs/${id}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("storybook-assets")
        .upload(path, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!upErr) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("storybook-assets").getPublicUrl(path);
        pdfUrl = publicUrl;

        await supabase
          .from("storybooks")
          .update({
            pages,
            pdf_url: pdfUrl,
            status: "approved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    }

    // Always return the PDF bytes for immediate download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${childName.replace(/\s+/g, "-")}-kingdom-quest.pdf"`,
        ...(pdfUrl ? { "X-PDF-URL": pdfUrl } : {}),
      },
    });
  } catch (err) {
    console.error("Approve/PDF error:", err);
    return NextResponse.json(
      { error: "Failed to build PDF" },
      { status: 500 }
    );
  }
}
