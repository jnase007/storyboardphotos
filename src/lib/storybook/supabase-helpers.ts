/**
 * Resolve Supabase public URL — supports both Next.js and short env names.
 */
export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).trim();
}

/**
 * Resolve anon key — supports NEXT_PUBLIC_ and short SUPABASE_ANON_KEY.
 */
export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  ).trim();
}

/**
 * Service role / secret key for server uploads.
 * Accepts legacy and newer Supabase env names.
 */
export function getSupabaseServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ""
  ).trim();
}

/** True when Supabase URL + service role look real (not placeholders). */
export function hasRealSupabase(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !key.includes("placeholder") &&
      !key.includes("your-") &&
      key.length > 20
  );
}
