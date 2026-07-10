import { NextRequest, NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/storybook/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";

export async function GET(request: NextRequest) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  if (!hasRealSupabase()) {
    return NextResponse.json({ storybooks: [] });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("storybooks")
      .select("id, child_name, child_age, gender, status, created_at, pages, pdf_url")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ storybooks: data ?? [] });
  } catch (err) {
    console.error("List storybooks error:", err);
    return NextResponse.json({ error: "Failed to load books" }, { status: 500 });
  }
}
