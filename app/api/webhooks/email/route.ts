import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-admin";

/**
 * Resend webhook — ingests bounces and complaints into the suppression list so
 * the send drain never mails a bad/complained address again. Resend signs
 * webhooks with Svix; we verify before trusting anything.
 *
 * Inert until `RESEND_WEBHOOK_SECRET` is set and the webhook endpoint is
 * registered in the Resend dashboard.
 */

/** Verify the Svix signature on a Resend webhook. */
function verifySignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  rawBody: string,
): boolean {
  // Secret is `whsec_<base64>` — the base64 part is the HMAC key.
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signed = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", key)
    .update(signed)
    .digest("base64");

  // The header is space-separated `v1,<sig>` entries — any match is valid.
  for (const part of svixSignature.split(" ")) {
    const sig = part.split(",")[1];
    if (!sig) continue;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  return false;
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook:email] RESEND_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (
    !svixId ||
    !svixTimestamp ||
    !svixSignature ||
    !verifySignature(secret, svixId, svixTimestamp, svixSignature, rawBody)
  ) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only hard bounces and complaints suppress an address.
  const reason =
    event.type === "email.bounced"
      ? "hard_bounce"
      : event.type === "email.complained"
        ? "complaint"
        : null;
  if (!reason) {
    // Delivered / opened / etc. — acknowledge and move on.
    return NextResponse.json({ ok: true });
  }

  const data = event.data ?? {};
  const to = Array.isArray(data.to)
    ? String(data.to[0] ?? "")
    : typeof data.to === "string"
      ? data.to
      : "";
  const email = to.trim().toLowerCase();
  const messageId =
    typeof data.email_id === "string" ? data.email_id : null;

  if (!email) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getServiceClient();

  // Suppress the address. The lower(email) unique index makes a repeat a
  // harmless 23505.
  const { error: suppErr } = await supabase
    .from("suppressions")
    .insert({ email, reason });
  if (suppErr && suppErr.code !== "23505") {
    console.error("[webhook:email] suppression insert:", suppErr.message);
  }

  // Attribute the event to its issue + subscriber via the provider message id.
  if (messageId) {
    const { data: send } = await supabase
      .from("issue_sends")
      .select("issue_id, subscriber_id")
      .eq("provider_message_id", messageId)
      .maybeSingle();
    if (send) {
      await supabase.from("issue_events").insert({
        issue_id: send.issue_id,
        subscriber_id: send.subscriber_id,
        type: reason === "hard_bounce" ? "bounce" : "complaint",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
