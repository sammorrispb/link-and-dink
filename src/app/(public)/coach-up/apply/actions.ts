"use server";

import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ApplyState = { ok: boolean; error?: string };

export const APPLY_INITIAL: ApplyState = { ok: false };

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Coach Up application submit. Writes to `coach_up_applications` via the
 * RLS-enforced anon client (the public INSERT policy allows it). v1 is
 * DB-row-only — Sam reads new applications from Supabase; no notification
 * email until the app has email infrastructure.
 */
export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  // Honeypot — real users never see this field; bots fill it. Fake success.
  if (field(formData, "company")) {
    return { ok: true };
  }

  const name = field(formData, "name");
  const email = field(formData, "email").toLowerCase();
  const why = field(formData, "why");

  if (!name) {
    return { ok: false, error: "Tell us your name." };
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!why) {
    return { ok: false, error: "Tell us why you want to coach." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("coach_up_applications").insert({
    name,
    email,
    phone: field(formData, "phone") || null,
    neighborhood: field(formData, "neighborhood") || null,
    dupr: field(formData, "dupr") || null,
    years_played: field(formData, "yearsPlayed") || null,
    where_play: field(formData, "wherePlay") || null,
    why,
    hours_per_week: field(formData, "hoursPerWeek") || null,
    weekend_availability: field(formData, "weekendAvailability") || null,
    commit_12wk: field(formData, "commit12wk") || null,
    honesty: field(formData, "honesty") || null,
    source: "coach_up_apply",
  });

  if (error) {
    console.error("[coach-up:apply] insert failed:", error.message);
    return { ok: false, error: "Something went wrong. Try again." };
  }

  return { ok: true };
}
