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
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const pages = body.pages as StoryPage[] | undefined;
    const childName = (body.child_name as string) || "Child";
    const bookTitle =
      (body.bookTitle as string) ||
      `${childName} and the Kingdom Quest`;
    // Art-only approval (no PDF rebuild) — gates movie spend
    const artOnly = body.art_only === true || body.mark_approved_only === true;

    if (artOnly) {
      if (hasRealSupabase() && !id.startsWith("local-")) {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from("storybooks")
          .update(
            pages?.length
              ? {
                  status: "approved",
                  pages,
                  updated_at: new Date().toISOString(),
                }
              : {
                  status: "approved",
                  updated_at: new Date().toISOString(),
                }
          )
          .eq("id", id)
          .select("id, status, child_name")
          .single();
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({
          ok: true,
          status: "approved",
          book: data,
          message: "Book art approved — safe to render movie",
        });
      }
      return NextResponse.json({
        ok: true,
        status: "approved",
        persisted: false,
        message: "Approved locally (no Supabase)",
      });
    }

    if (!pages?.length) {
      return NextResponse.json(
        { error: "pages are required (or pass art_only:true)" },
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
      } else {
        // Still mark approved so movie gate works even if PDF storage fails
        await supabase
          .from("storybooks")
          .update({
            pages,
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
