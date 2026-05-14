import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { getEmailProvider } from "@/lib/email";
import { confirmUrl } from "@/lib/email/links";
import { renderConfirmationEmail } from "@/lib/email/confirmation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SOURCES = ["homepage_hero", "homepage_reprise"];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const source =
    typeof data.source === "string" && VALID_SOURCES.includes(data.source)
      ? data.source
      : null;
  const honeypot = typeof data.company === "string" ? data.company : "";

  // Honeypot — real users never see or fill this field. Bots do. Fake success.
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error("[subscribe]", err);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }

  // Generate the id ourselves so we can build the confirmation link — the
  // publishable-key client can't read the row back under the INSERT-only RLS
  // policy. The subscriber starts unconfirmed (confirmed_at defaults null).
  const id = crypto.randomUUID();
  const { error } = await supabase
    .from("subscribers")
    .insert({ id, email, source });

  if (error) {
    // 23505 = unique violation: already in the system. Treat as success — we
    // don't reveal list membership. (v1 limitation: doesn't re-send the
    // confirmation if they signed up before but never confirmed — see TODO.)
    if (error.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    console.error("[subscribe] insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }

  // Double opt-in: send the confirmation email. A send failure is a soft error
  // — the signup itself succeeded, so don't fail the request.
  try {
    const { subject, html, text } = renderConfirmationEmail(confirmUrl(id));
    const result = await getEmailProvider().send({ to: email, subject, html, text });
    if ("error" in result) {
      console.error("[subscribe] confirmation send failed:", result.error);
    }
  } catch (err) {
    console.error("[subscribe] confirmation send threw:", err);
  }

  return NextResponse.json({ ok: true });
}
