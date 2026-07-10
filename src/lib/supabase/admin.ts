import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "../storybook/supabase-helpers";

/**
 * Service-role client for server-side operations (API routes).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createServiceClient() {
  const key = getSupabaseServiceRoleKey();
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) on the server."
    );
  }
  return createClient<Database>(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
