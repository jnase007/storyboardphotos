import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const NOTIFY_TO = "justinnassie@gmail.com";

const payloadSchema = z.object({
  childName: z.string().trim().min(1).max(80),
  gender: z.enum(["girl", "boy"]),
  product: z.enum(["book", "movie", "both"]),
  adventureId: z.string().min(1).max(80),
  adventureLabel: z.string().min(1).max(120),
  adventureTitle: z.string().min(1).max(160),
  adventureDescription: z.string().max(500).optional(),
  bibleVerse: z.string().max(120).optional(),
  submittedAt: z.string().optional(),
});

function productLabel(product: "book" | "movie" | "both") {
  if (product === "book") return "Storybook";
  if (product === "movie") return "Kingdom Movie";
  return "Storybook + Movie";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
async function sendWithResend(subject: string, text: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, reason: "no-resend-key" };

  const from =
    process.env.RESEND_FROM ||
    "Storybook Photos Kiosk <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [NOTIFY_TO],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend kiosk email failed:", res.status, body);
    return { ok: false as const, reason: `resend-${res.status}` };
  }
  return { ok: true as const, provider: "resend" as const };
}

async function sendWithFormSubmit(subject: string, text: string, html: string) {
  // No API key required — creates an email trail to Justin's inbox.
  const res = await fetch(`https://formsubmit.co/ajax/${NOTIFY_TO}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      _template: "table",
      _captcha: "false",
      message: text,
      html,
      source: "storybook-photos-kiosk",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("FormSubmit kiosk email failed:", res.status, body);
    return { ok: false as const, reason: `formsubmit-${res.status}` };
  }
  return { ok: true as const, provider: "formsubmit" as const };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid kiosk submission", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const role = data.gender === "girl" ? "Queen" : "King";
    const when = data.submittedAt || new Date().toISOString();
    const product = productLabel(data.product);

    const subject = `Kiosk pick: ${role} ${data.childName} — ${data.adventureLabel}`;
    const text = [
      "New Storybook Photos kiosk submission",
      "",
      `Child: ${role} ${data.childName}`,
      `Quest: ${data.adventureTitle} (${data.adventureId})`,
      `Summary: ${data.adventureDescription || "—"}`,
      `Product: ${product}`,
      data.bibleVerse ? `Verse: ${data.bibleVerse}` : null,
      `Submitted: ${when}`,
      "",
      "Source: https://www.storybookphotos.com/kiosk",
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <div style="font-family:Georgia,serif;line-height:1.5;color:#1E3352">
        <h2 style="margin:0 0 12px">New kiosk adventure pick</h2>
        <p><strong>Child:</strong> ${role} ${escapeHtml(data.childName)}</p>
        <p><strong>Quest:</strong> ${escapeHtml(data.adventureTitle)}</p>
        <p><strong>Summary:</strong> ${escapeHtml(data.adventureDescription || "—")}</p>
        <p><strong>Product:</strong> ${escapeHtml(product)}</p>
        ${
          data.bibleVerse
            ? `<p><strong>Verse:</strong> ${escapeHtml(data.bibleVerse)}</p>`
            : ""
        }
        <p><strong>Submitted:</strong> ${escapeHtml(when)}</p>
        <p style="color:#666;font-size:13px">Source: storybookphotos.com/kiosk</p>
      </div>
    `;

    // Prefer Resend when configured; otherwise FormSubmit email bridge.
    let result = await sendWithResend(subject, text, html);
    if (!result.ok) {
      result = await sendWithFormSubmit(subject, text, html);
    }

    if (!result.ok) {
      console.error("Kiosk notify failed completely:", result.reason, data);
      // Still accept the submission so the kiosk UX does not break offline.
      return NextResponse.json({
        success: true,
        emailed: false,
        warning: "Submission saved on device; email notify failed",
      });
    }

    return NextResponse.json({
      success: true,
      emailed: true,
      provider: result.provider,
      to: NOTIFY_TO,
    });
  } catch (error) {
    console.error("Kiosk submit API error:", error);
    return NextResponse.json(
      { error: "Could not submit kiosk pick" },
      { status: 500 }
    );
  }
}
