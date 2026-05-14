import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One-click unsubscribe (RFC 8058). Hit by:
 *  - the `List-Unsubscribe` mail-client one-click (POST, no UI), and
 *  - the confirmation page's button (POST).
 *
 * The `unsubscribe_token` query param is the credential — an unguessable
 * per-subscriber UUID. POST-only so a link prefetcher can't unsubscribe anyone.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const issueId = url.searchParams.get("i");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }
  // A malformed token can't be a real one — return success without touching the
  // DB (querying a uuid column with a non-uuid string errors, and we don't want
  // to leak whether a token is valid anyway).
  if (!UUID_RE.test(token)) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getServiceClient();

  const { data: sub, error: lookupErr } = await supabase
    .from("subscribers")
    .select("id, email, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (lookupErr) {
    console.error("[unsubscribe] lookup:", lookupErr.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
  // Don't reveal whether the token was valid — always report success.
  if (!sub) {
    return NextResponse.json({ ok: true });
  }

  if (sub.status !== "unsubscribed") {
    await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
  }

  // Suppression list is the single source of truth the send drain checks.
  // The lower(email) unique index makes a re-unsubscribe a harmless 23505.
  const { error: suppErr } = await supabase
    .from("suppressions")
    .insert({ email: sub.email.toLowerCase(), reason: "unsubscribe" });
  if (suppErr && suppErr.code !== "23505") {
    console.error("[unsubscribe] suppression insert:", suppErr.message);
  }

  // Attribute to an issue when we know which one sent them here.
  if (issueId) {
    await supabase.from("issue_events").insert({
      issue_id: issueId,
      subscriber_id: sub.id,
      type: "unsubscribe",
    });
  }

  return NextResponse.json({ ok: true });
}
