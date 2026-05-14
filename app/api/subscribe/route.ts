import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

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

  const { error } = await supabase.from("subscribers").insert({ email, source });

  if (error) {
    // 23505 = unique violation: already subscribed. Treat as success — the
    // outcome the user wants, and we don't reveal who's on the list.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    console.error("[subscribe] insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
