import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ACCESS_CODE } from "@/lib/storybook/types";

/**
 * Soft staff gate for admin API routes (matches password-gate code 3121).
 */
export function assertAdminAccess(request: NextRequest): NextResponse | null {
  const code =
    request.headers.get("x-admin-code") ??
    request.nextUrl.searchParams.get("code");
  if (code !== ADMIN_ACCESS_CODE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
