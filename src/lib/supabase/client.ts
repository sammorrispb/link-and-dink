import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseEnv } from "../env";
import type { Database } from "./types";

/**
 * RLS-enforced Supabase client for Client Components. Used for the magic-link
 * sign-in form.
 */
export function createClient() {
  const { url, anonKey } = publicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
