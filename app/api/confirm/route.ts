import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-admin";
import { verify, siteUrl } from "@/lib/email/links";

/**
 * Double opt-in confirmation. The link is `/api/confirm?sid=<id>&sig=<hmac>` —
 * the HMAC signature is what makes it unforgeable (no stored confirm token
 * needed). Sets `confirmed_at`; only confirmed subscribers are ever enqueued.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sid = url.searchParams.get("sid");
  const sig = url.searchParams.get("sig");

  if (!sid || !sig || !verify(`confirm:${sid}`, sig)) {
    return NextResponse.redirect(siteUrl("/confirmed?status=invalid"));
  }

  const supabase = getServiceClient();
  // `.is("confirmed_at", null)` makes a re-click a harmless no-op.
  const { error } = await supabase
    .from("subscribers")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", sid)
    .is("confirmed_at", null);

  if (error) {
    console.error("[confirm]", error.message);
    return NextResponse.redirect(siteUrl("/confirmed?status=error"));
  }

  return NextResponse.redirect(siteUrl("/confirmed?status=ok"));
}
