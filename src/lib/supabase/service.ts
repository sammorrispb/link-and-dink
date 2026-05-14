import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseEnv } from "../env";
import type { Database } from "./types";

/**
 * Service-role Supabase client. BYPASSES RLS — never import this into a Client
 * Component, and never return raw rows from it to the browser without picking
 * the fields you mean to expose.
 *
 * Used by the public discovery page (a Server Component) to read event +
 * roster + results data for anonymous visitors. RLS still governs the
 * anon/authenticated data API; this is the trusted server read path.
 */
export function createServiceClient() {
  const { url } = publicSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY — see .env.example");
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
