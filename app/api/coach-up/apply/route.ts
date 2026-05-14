import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { getEmailProvider } from "@/lib/email";
import {
  renderCoachUpApplicationEmail,
  type CoachUpApplication,
} from "@/lib/email/coach-up-application";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;

  // Honeypot — real users never see or fill this field. Bots do. Fake success.
  if (str(data.company)) {
    return NextResponse.json({ ok: true });
  }

  const name = str(data.name);
  const email = str(data.email).toLowerCase();
  const why = str(data.why);

  if (!name) {
    return NextResponse.json({ error: "Tell us your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (!why) {
    return NextResponse.json(
      { error: "Tell us why you want to coach." },
      { status: 400 },
    );
  }

  const application: CoachUpApplication = {
    name,
    email,
    phone: str(data.phone),
    neighborhood: str(data.neighborhood),
    dupr: str(data.dupr),
    yearsPlayed: str(data.yearsPlayed),
    wherePlay: str(data.wherePlay),
    why,
    hoursPerWeek: str(data.hoursPerWeek),
    weekendAvailability: str(data.weekendAvailability),
    commit12wk: str(data.commit12wk),
    honesty: str(data.honesty),
  };

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error("[coach-up:apply]", err);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }

  // Generate the id ourselves — the publishable-key client can't read the row
  // back under the INSERT-only RLS policy on `coach_up_applications`.
  const id = crypto.randomUUID();
  const { error } = await supabase.from("coach_up_applications").insert({
    id,
    name: application.name,
    email: application.email,
    phone: application.phone,
    neighborhood: application.neighborhood,
    dupr: application.dupr,
    years_played: application.yearsPlayed,
    where_play: application.wherePlay,
    why: application.why,
    hours_per_week: application.hoursPerWeek,
    weekend_availability: application.weekendAvailability,
    commit_12wk: application.commit12wk,
    honesty: application.honesty,
    source: "coach_up_apply",
  });

  if (error) {
    console.error("[coach-up:apply] insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }

  // Notify Sam. A send failure is a soft error — the application itself
  // saved, so don't fail the request.
  try {
    const to = process.env.COACH_UP_NOTIFY_EMAIL;
    if (!to) {
      console.warn("[coach-up:apply] COACH_UP_NOTIFY_EMAIL not configured");
    } else {
      const { subject, html, text } = renderCoachUpApplicationEmail(application);
      const result = await getEmailProvider().send({
        to,
        subject,
        html,
        text,
        replyTo: application.email,
      });
      if ("error" in result) {
        console.error("[coach-up:apply] notification send failed:", result.error);
      }
    }
  } catch (err) {
    console.error("[coach-up:apply] notification send threw:", err);
  }

  return NextResponse.json({ ok: true });
}
