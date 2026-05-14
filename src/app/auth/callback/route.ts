import { NextResponse } from "next/server";
import { ensureAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link callback. Supabase redirects here with a `code`; we exchange it
 * for a session, make sure the account row exists, then bounce to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  // Only allow same-origin relative redirects.
  const safeNext = next.startsWith("/") ? next : "/";

  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=missing_code", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/?auth_error=exchange_failed", url.origin));
  }

  // Claim / create the account row on first sign-in.
  try {
    await ensureAccount(supabase);
  } catch {
    // Non-fatal here — the RSVP action calls ensureAccount again defensively.
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
