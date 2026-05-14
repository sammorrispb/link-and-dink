// Environment access with explicit validation.
//
// NEXT_PUBLIC_* vars must be read via literal `process.env.X` so Next inlines
// them at build time (a dynamic `process.env[name]` lookup would be undefined
// in the browser). These module-level reads are the inlined values.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Public Supabase config — safe to use in Client and Server Components. */
export function publicSupabaseEnv(): { url: string; anonKey: string } {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — see .env.example",
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
