import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import {
  persistMovieToStorage,
  renderPremiumStoryMovie,
} from "@/lib/storybook/render-movie";
import type { StoryPage } from "@/lib/storybook/types";
import { buildNarrationScript } from "@/lib/storybook/narration";
import { TITLE_ROLE } from "@/lib/storybook/adventure-paths";
import {
  buildTracker,
  encodeMovieTracker,
  type MovieTrackerState,
} from "@/lib/storybook/movie-tracker";

export const maxDuration = 800;

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  package: z.enum(["teaser", "full"]).default("teaser"),
  /**
   * standard|fast = real animated movie (DEFAULT) — $150 delivery (~$15 target / $50 max)
   * draft = cheap stills slideshow only
   * premium = blocked unless ALLOW_PREMIUM_MOVIE=1
   */
  quality: z.enum(["draft", "fast", "standard", "premium"]).default("standard"),
  force: z.boolean().optional(),
  /** default true — movies should have bedtime story sound */
  generateNarrationIfMissing: z.boolean().optional().default(true),
  /** async (default): return immediately + Domino tracker; sync: wait for MP4 */
  mode: z.enum(["async", "sync"]).default("async"),
});

async function writeTracker(
  supabase: ReturnType<typeof createServiceClient>,
  id: string,
  state: MovieTrackerState,
  extra?: { video_status?: string; video_url?: string | null; video_package?: string }
) {
  const patch: {
    video_notes: string;
    updated_at: string;
    video_status?: string;
    video_url?: string | null;
    video_package?: string;
    video_delivered_at?: string;
  } = {
    video_notes: encodeMovieTracker(state),
    updated_at: new Date().toISOString(),
  };
  if (extra?.video_status) patch.video_status = extra.video_status;
  if (extra?.video_url !== undefined) patch.video_url = extra.video_url;
  if (extra?.video_package) patch.video_package = extra.video_package;
  if (state.step === "done" && state.videoUrl) {
    patch.video_delivered_at = new Date().toISOString();
  }
  await supabase.from("storybooks").update(patch).eq("id", id);
}

async function runRenderJob(options: {
  id: string;
  packageKind: "teaser" | "full";
  quality: "draft" | "fast" | "standard" | "premium";
  force?: boolean;
  generateNarrationIfMissing: boolean;
}) {
  const { id, packageKind, quality, generateNarrationIfMissing } = options;
  const supabase = createServiceClient();
  const startedAt = new Date().toISOString();

  const bump = async (
    step: Parameters<typeof buildTracker>[0]["step"],
    detail?: string,
    extra?: { clipsDone?: number; clipsTotal?: number; videoUrl?: string; error?: string }
  ) => {
    const state = buildTracker({
      step,
      detail,
      startedAt,
      clipsDone: extra?.clipsDone,
      clipsTotal: extra?.clipsTotal,
      videoUrl: extra?.videoUrl,
      error: extra?.error,
    });
    const status =
      step === "done"
        ? "ready"
        : step === "failed"
          ? "requested"
          : "in_production";
    await writeTracker(supabase, id, state, {
      video_status: status,
      video_url: step === "done" ? extra?.videoUrl ?? null : undefined,
      video_package: `${quality}:${packageKind}`,
    });
    return state;
  };

  try {
    const { data: book, error } = await supabase
      .from("storybooks")
      .select(
        "id, child_name, gender, pages, narration_url, narration_script, video_url, video_status, video_package"
      )
      .eq("id", id)
      .single();

    if (error || !book) {
      await bump("failed", "Book not found", { error: "Book not found" });
      return;
    }

    if (book.video_url && !options.force) {
      await bump("done", "Movie already ready", { videoUrl: book.video_url });
      return;
    }

    const pages = (book.pages || []) as StoryPage[];
    if (!pages.some((p) => p?.imageUrl)) {
      await bump("failed", "No illustrated pages", {
        error: "Book has no illustrated pages to animate",
      });
      return;
    }

    // Engine now builds PER-PAGE narration timed to each animated shot.
    // Optional whole-book URL kept only as emergency fallback merge.
    let narrationUrl = book.narration_url as string | null;
    if (narrationUrl && narrationUrl.startsWith("data:")) narrationUrl = null;

    const requireSound = quality === "standard" || quality === "premium";
    await bump(
      "prep",
      "Per-page narration + Seedance animation (voice matches each picture)…"
    );

    const uploadAudio = async (bytes: Buffer, filename: string) => {
      const path = `narration/${id}/${filename}`;
      const { error: upErr } = await supabase.storage
        .from("storybook-assets")
        .upload(path, bytes, { contentType: "audio/mpeg", upsert: true });
      if (upErr) {
        console.error("narration upload", upErr.message);
        return null;
      }
      const { data: pub } = supabase.storage
        .from("storybook-assets")
        .getPublicUrl(path);
      return pub.publicUrl || null;
    };

    await bump("oven", "Pages going into the oven…", {
      clipsDone: 0,
      clipsTotal: pages.filter((p) => p.imageUrl).length,
    });

    const coverImageUrl = pages.find((p) => p.imageUrl)?.imageUrl ?? null;
    const gender = (book.gender === "girl" ? "girl" : "boy") as "boy" | "girl";
    const role = TITLE_ROLE[gender];
    const wholeScript =
      (book.narration_script as string) ||
      buildNarrationScript(book.child_name, role, pages);

    const rendered = await renderPremiumStoryMovie({
      childName: book.child_name,
      gender: book.gender,
      pages,
      narrationUrl,
      narrationScript: wholeScript,
      package: packageKind,
      quality,
      coverImageUrl,
      uploadAudio,
      onProgress: (p) => {
        void (async () => {
          if (p.stage === "animating") {
            await bump("oven", p.detail, {
              clipsDone: p.clipsDone,
              clipsTotal: p.clipsTotal,
            });
          } else if (p.stage === "stitching") {
            await bump("quality", p.detail || "Stitching clips…");
          } else if (p.stage === "audio") {
            await bump("delivery", p.detail || "Mixing narration…");
          } else if (p.stage === "done") {
            await bump("delivery", "Packaging MP4…");
          }
        })();
      },
    });

    await bump("delivery", "Boxing up the MP4…");

    const publicUrl = await persistMovieToStorage({
      supabase,
      bookId: id,
      videoUrl: rendered.videoUrl,
    });

    await bump("done", `Ready · ${rendered.pagesUsed} pages animated`, {
      videoUrl: publicUrl,
      clipsDone: rendered.clipUrls.length,
      clipsTotal: rendered.pagesUsed,
    });

    // Append human notes after tracker so ops can still read provider logs
    const tracker = buildTracker({
      step: "done",
      detail: `Ready · ${rendered.pagesUsed} pages animated`,
      startedAt,
      videoUrl: publicUrl,
      clipsDone: rendered.clipUrls.length,
      clipsTotal: rendered.pagesUsed,
    });
    const human = [
      encodeMovieTracker(tracker),
      "",
      `provider=${rendered.provider}`,
      ...rendered.notes.slice(0, 12),
    ].join("\n");
    await supabase
      .from("storybooks")
      .update({
        video_notes: human,
        video_url: publicUrl,
        video_status: "ready",
        video_package: `${quality}:${packageKind}`,
        video_delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Render failed";
    console.error("render-movie job:", err);
    await bump("failed", message.slice(0, 200), { error: message.slice(0, 500) });
  }
}

/**
 * Admin: start movie render.
 * Default quality = draft (cheap still-hold). Premium is opt-in only.
 * Default async = Domino's tracker (returns immediately, work continues).
 * NOTE: Vercel after() is unreliable for long Seedance jobs — prefer draft/fast or local worker.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { id } = await params;

  if (!hasRealSupabase() || id.startsWith("local-")) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: book, error } = await supabase
      .from("storybooks")
      .select("id, child_name, video_url, video_status, pages")
      .eq("id", id)
      .single();

    if (error || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.video_url && !parsed.data.force) {
      return NextResponse.json({
        id: book.id,
        video_url: book.video_url,
        video_status: book.video_status || "ready",
        message: "Movie already ready (pass force:true to re-render)",
        reused: true,
      });
    }

    const pages = (book.pages || []) as StoryPage[];
    if (!pages.some((p) => p?.imageUrl)) {
      return NextResponse.json(
        { error: "Book has no illustrated pages to animate" },
        { status: 400 }
      );
    }

    const startedAt = new Date().toISOString();
    const quality = parsed.data.quality;
    const packageKind = parsed.data.package;
    // COST LOCK (2026-08-10): Vercel after() dies mid Seedance job and restarts re-bill fal.
    // Only draft may cook on serverless. Paid movies queue for Mac mini local worker.
    const allowServerlessSeedance =
      process.env.ALLOW_VERCEL_SEEDANCE === "1" ||
      process.env.ALLOW_VERCEL_SEEDANCE === "true";
    const needsLocalWorker = quality !== "draft" && !allowServerlessSeedance;

    if (needsLocalWorker && parsed.data.mode !== "sync") {
      const queuedLocal = buildTracker({
        step: "queued",
        detail:
          "Queued for Mac mini movie worker (no Vercel Seedance — stops mid-job waste)…",
        startedAt,
      });
      await writeTracker(supabase, id, queuedLocal, {
        video_status: "in_production",
        video_package: `${quality}:${packageKind}`,
      });
      await supabase
        .from("storybooks")
        .update({
          video_notes:
            encodeMovieTracker(queuedLocal) +
            "\nLOCAL_WORKER_QUEUE|standard-seedance|do-not-run-on-vercel",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json(
        {
          id: book.id,
          child_name: book.child_name,
          video_status: "in_production",
          tracker: queuedLocal,
          worker: "local",
          message:
            "Queued on Mac mini worker 🎬 (Seedance no longer runs on Vercel — stops mid-job waste).",
          poll: `/api/storybooks/${id}/video`,
        },
        { status: 202 }
      );
    }

    const queued = buildTracker({
      step: "queued",
      detail: "Order received — starting the kitchen…",
      startedAt,
    });
    await writeTracker(supabase, id, queued, {
      video_status: "in_production",
      video_package: `${quality}:${packageKind}`,
    });

    if (parsed.data.mode === "sync") {
      await runRenderJob({
        id,
        packageKind,
        quality,
        force: parsed.data.force,
        generateNarrationIfMissing: parsed.data.generateNarrationIfMissing,
      });
      const { data: done } = await supabase
        .from("storybooks")
        .select(
          "id, child_name, video_status, video_url, video_package, video_notes, narration_url"
        )
        .eq("id", id)
        .single();
      return NextResponse.json({
        ...done,
        message: done?.video_url
          ? "MP4 ready"
          : "Render finished without URL — check tracker notes",
      });
    }

    // Draft-only async on Vercel (cheap stills). Paid Seedance blocked above.
    after(() =>
      runRenderJob({
        id,
        packageKind,
        quality,
        force: parsed.data.force,
        generateNarrationIfMissing: parsed.data.generateNarrationIfMissing,
      })
    );

    return NextResponse.json(
      {
        id: book.id,
        child_name: book.child_name,
        video_status: "in_production",
        tracker: queued,
        worker: quality === "draft" ? "vercel-draft" : "vercel",
        message:
          quality === "draft"
            ? "Draft slideshow cooking on Vercel…"
            : "Pizza’s in the oven 🍕 Domino tracker live — refresh Movie Queue for progress.",
        poll: `/api/storybooks/${id}/video`,
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("render-movie start error:", err);
    const message = err instanceof Error ? err.message : "Render failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
