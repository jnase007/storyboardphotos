import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side image proxy — fetches external images and returns them as base64
 * so the client-side PDF builder can embed them without CORS issues.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "StorybookPhotos/1.0" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ dataUrl, contentType });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
