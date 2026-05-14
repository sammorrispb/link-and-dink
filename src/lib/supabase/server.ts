import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicSupabaseEnv } from "../env";
import type { Database } from "./types";

/**
 * RLS-enforced Supabase client for Server Components, Route Handlers, and
 * Server Actions. Reads the user's session from cookies; every query runs as
 * the authenticated user (or anon). Use this for anything the signed-in user
 * does — RSVP creation, reading their own data.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = publicSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — safe to ignore; middleware
          // refreshes the session cookie on the next request.
        }
      },
    },
  });
}
