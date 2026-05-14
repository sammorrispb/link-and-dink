import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * Bypasses RLS, so it's the only way the newsletter platform can read the
 * subscriber list (to send) and write the issues/sends/events/links/suppressions
 * tables, which are all RLS deny-all. The `server-only` import above turns any
 * accidental client-side import into a build error.
 *
 * Never log this key, never prefix it with NEXT_PUBLIC_, never return it to a
 * client. The publishable-key client in `./supabase` stays the only thing the
 * public `/api/subscribe` path touches.
 */
export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
