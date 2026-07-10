import { NextRequest, NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import { buildStorybookPdf } from "@/lib/storybook/build-pdf";
import type { StoryPage } from "@/lib/storybook/types";

export const maxDuration = 120;

/**
 * Server-side PDF generation — images are fetched server-side, no CORS issues.
 */
export async function POST(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { bookTitle, childName, pages } = body as {
      bookTitle: string;
      childName: string;
      pages: StoryPage[];
    };

    if (!bookTitle || !childName || !pages?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pdfBlob = await buildStorybookPdf({
      bookTitle,
      childName,
      pages,
      includeCover: true,
      includeBack: true,
    });

    const pdfBuffer = await pdfBlob.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${childName.replace(/\s+/g, "-")}-Kingdom-Quest.pdf"`,
      },
    });
  } catch (err) {
    console.error("Server PDF error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
