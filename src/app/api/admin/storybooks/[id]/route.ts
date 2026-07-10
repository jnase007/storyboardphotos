import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { updatePagesSchema } from "@/lib/storybook/validations";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";

type Params = { params: Promise<{ id: string }> };

/**
 * Save edited page text / titles for a storybook.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updatePagesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid pages", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!hasRealSupabase() || id.startsWith("local-")) {
      return NextResponse.json({
        id,
        pages: parsed.data.pages,
        status: "ready",
        persisted: false,
      });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("storybooks")
      .update({
        pages: parsed.data.pages,
        updated_at: new Date().toISOString(),
        status: "ready",
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ...data, persisted: true });
  } catch (err) {
    console.error("Update storybook error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { id } = await params;
  if (!hasRealSupabase() || id.startsWith("local-")) {
    return NextResponse.json(
      { error: "Not found in database (local session)" },
      { status: 404 }
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("storybooks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
