import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PlayerRow } from "./supabase/types";

const NANP_DIGITS = 10;

export interface PhoneNormalizationOk {
  ok: true;
  e164: string;
  digits: string;
}
export interface PhoneNormalizationErr {
  ok: false;
  reason: string;
}
export type PhoneNormalization = PhoneNormalizationOk | PhoneNormalizationErr;

/**
 * Normalize a user-typed phone to E.164 (US-only). Accepts inputs like
 * "(301) 555-1234", "+1 301 555 1234", "3015551234". Strict: anything that
 * doesn't reduce to a 10-digit NANP number is rejected.
 */
export function normalizePhone(raw: string): PhoneNormalization {
  const digitsOnly = raw.replace(/\D+/g, "");
  let digits = digitsOnly;
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== NANP_DIGITS) {
    return { ok: false, reason: "Enter a 10-digit US phone number" };
  }
  if (digits[0] === "0" || digits[0] === "1") {
    return { ok: false, reason: "Area code can't start with 0 or 1" };
  }
  return { ok: true, e164: `+1${digits}`, digits };
}

/** Strip any leading @ and surrounding whitespace; leave the rest untouched. */
export function normalizeVenmoHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

/** Compose a display_name from first + last; fall back gracefully. */
export function composeDisplayName(
  first: string | null | undefined,
  last: string | null | undefined,
): string {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  if (f && l) return `${f} ${l[0]}.`;
  if (f) return f;
  if (l) return l;
  return "Player";
}

export interface UpsertPlayerInput {
  firstName: string;
  lastName: string;
  phoneE164: string;
  venmoHandle: string;
  email: string | null;
}

/**
 * Find-or-create a player by phone. If a row exists with this phone, refresh
 * name/venmo/email fields (people change Venmo handles; we trust the most
 * recent RSVP). Returns the player row.
 *
 * Must be called with the service-role client (anonymous RSVP path bypasses RLS).
 */
export async function upsertPlayerByPhone(
  supabase: SupabaseClient<Database>,
  input: UpsertPlayerInput,
): Promise<PlayerRow> {
  const display = composeDisplayName(input.firstName, input.lastName);

  const { data: existing, error: selectErr } = await supabase
    .from("players")
    .select("*")
    .eq("phone", input.phoneE164)
    .maybeSingle();
  if (selectErr) throw selectErr;

  if (existing) {
    const { data: updated, error: updErr } = await supabase
      .from("players")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        venmo_handle: input.venmoHandle,
        email: input.email,
        display_name: existing.display_name || display,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (updErr) throw updErr;
    return updated;
  }

  const { data: created, error: insertErr } = await supabase
    .from("players")
    .insert({
      display_name: display,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phoneE164,
      venmo_handle: input.venmoHandle,
      email: input.email,
    })
    .select("*")
    .single();
  if (insertErr) throw insertErr;
  return created;
}
