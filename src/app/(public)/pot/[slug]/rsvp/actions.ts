"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ageOnDate, maxAgeFor } from "@/lib/domain";
import { getEventWithRoster } from "@/lib/events";
import { normalizePhone, normalizeVenmoHandle, upsertPlayerByPhone } from "@/lib/players";
import { createServiceClient } from "@/lib/supabase/service";
import { rsvpCookieName, signRsvpCookie, verifyRsvpCookie } from "@/lib/tokens";

const POSTGRES_UNIQUE_VIOLATION = "23505";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Anonymous Pot Night RSVP per the v1 product spec — phone is the dedup key,
 * no player login required. Runs via the service-role client; RLS still
 * governs every authenticated path.
 *
 * Youth events (event.ageBracket set): the player record is the parent; the
 * child's first/last/birthdate ride on the rsvp row alongside guardian
 * consent.
 */
export async function rsvpAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const venmoRaw = String(formData.get("venmo_handle") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();

  if (!slug) throw new Error("Missing event slug");
  if (!firstName) throw new Error("First name is required");
  if (!lastName) throw new Error("Last name is required");
  if (!venmoRaw) throw new Error("Venmo handle is required");

  const phone = normalizePhone(phoneRaw);
  if (!phone.ok) throw new Error(phone.reason);
  const venmoHandle = normalizeVenmoHandle(venmoRaw);
  if (!venmoHandle) throw new Error("Venmo handle is required");
  const email = emailRaw || null;

  const data = await getEventWithRoster(slug);
  if (!data) throw new Error("Event not found");
  const { event, confirmedCount } = data;

  const youthFields = event.ageBracket
    ? validateYouthFields(formData, event.ageBracket, event.startsAt, event.waiverUrl)
    : null;

  const sb = createServiceClient();
  const player = await upsertPlayerByPhone(sb, {
    firstName,
    lastName,
    phoneE164: phone.e164,
    venmoHandle,
    email,
  });

  const { data: existing } = await sb
    .from("rsvps")
    .select("id, status")
    .eq("event_id", event.id)
    .eq("player_id", player.id)
    .maybeSingle();

  if (existing && existing.status !== "canceled") {
    await setRsvpCookie({ playerId: player.id, eventId: event.id });
    redirect(`/pot/${slug}/confirmed`);
  }

  const isConfirmed = confirmedCount < event.maxPlayers;
  const status = isConfirmed ? "confirmed" : "waitlist";
  const position = confirmedCount + 1;

  if (existing) {
    const { error: updErr } = await sb
      .from("rsvps")
      .update({ status, position, ...youthFields })
      .eq("id", existing.id);
    if (updErr) throw updErr;
  } else {
    const { error: insErr } = await sb.from("rsvps").insert({
      event_id: event.id,
      player_id: player.id,
      account_id: null,
      payment_status: "intent",
      status,
      position,
      ...youthFields,
    });
    if (insErr && insErr.code !== POSTGRES_UNIQUE_VIOLATION) throw insErr;
  }

  await setRsvpCookie({ playerId: player.id, eventId: event.id });
  redirect(`/pot/${slug}/confirmed`);
}

interface YouthRsvpFields {
  child_first_name: string;
  child_last_name: string;
  child_birthdate: string;
  guardian_consent: boolean;
  guardian_consent_at: string;
}

function validateYouthFields(
  formData: FormData,
  ageBracket: "11U" | "14U",
  eventStartsAt: string,
  waiverUrl: string | null,
): YouthRsvpFields {
  const childFirst = String(formData.get("child_first_name") ?? "").trim();
  const childLast = String(formData.get("child_last_name") ?? "").trim();
  const childBirthdate = String(formData.get("child_birthdate") ?? "").trim();
  const consent = formData.get("guardian_consent") === "on";

  if (!childFirst) throw new Error("Player's first name is required");
  if (!childLast) throw new Error("Player's last name is required");
  if (!ISO_DATE.test(childBirthdate)) {
    throw new Error("Player's date of birth is required");
  }

  const cap = maxAgeFor(ageBracket);
  const ageAtEvent = ageOnDate(childBirthdate, eventStartsAt);
  if (ageAtEvent < 0) throw new Error("Birthdate can't be in the future");
  if (ageAtEvent >= cap) {
    throw new Error(`This event is ${ageBracket} — player must be under ${cap} on event day`);
  }

  if (waiverUrl && !consent) {
    throw new Error("Parent/guardian must agree to the waiver to RSVP");
  }

  return {
    child_first_name: childFirst,
    child_last_name: childLast,
    child_birthdate: childBirthdate,
    guardian_consent: consent,
    guardian_consent_at: new Date().toISOString(),
  };
}

export async function cancelRsvpAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("Missing event slug");

  const cookieStore = await cookies();
  const raw = cookieStore.get(rsvpCookieName)?.value;
  const payload = verifyRsvpCookie(raw);
  if (!payload) redirect(`/pot/${slug}`);

  const sb = createServiceClient();
  const { data: event } = await sb.from("events").select("id").eq("slug", slug).maybeSingle();
  if (!event || event.id !== payload.eventId) redirect(`/pot/${slug}`);

  const { error } = await sb
    .from("rsvps")
    .update({ status: "canceled" })
    .eq("event_id", event.id)
    .eq("player_id", payload.playerId);
  if (error) throw error;

  cookieStore.delete(rsvpCookieName);
  redirect(`/pot/${slug}`);
}

async function setRsvpCookie(payload: { playerId: string; eventId: string }) {
  const cookieStore = await cookies();
  cookieStore.set(rsvpCookieName, signRsvpCookie(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}
