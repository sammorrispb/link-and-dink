"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEventWithRoster } from "@/lib/events";
import { normalizePhone, normalizeVenmoHandle, upsertPlayerByPhone } from "@/lib/players";
import { createServiceClient } from "@/lib/supabase/service";
import { rsvpCookieName, signRsvpCookie, verifyRsvpCookie } from "@/lib/tokens";

const POSTGRES_UNIQUE_VIOLATION = "23505";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

/**
 * Anonymous Pot Night RSVP per the v1 product spec — phone is the dedup key,
 * no player login required. Runs via the service-role client; RLS still
 * governs every authenticated path.
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
      .update({ status, position })
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
    });
    if (insErr && insErr.code !== POSTGRES_UNIQUE_VIOLATION) throw insErr;
  }

  await setRsvpCookie({ playerId: player.id, eventId: event.id });
  redirect(`/pot/${slug}/confirmed`);
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
