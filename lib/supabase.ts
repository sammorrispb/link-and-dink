import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for the link-and-dink project.
 * Uses the publishable key — writes are gated by an INSERT-only RLS policy on
 * `subscribers`, so there's no service-role secret in the environment.
 */
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variable",
    );
  }
  return createClient(url, key);
}
