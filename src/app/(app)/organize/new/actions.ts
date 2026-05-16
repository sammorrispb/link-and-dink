"use server";

import { redirect } from "next/navigation";
import type { AgeBracket } from "@/lib/domain";
import { createEvent } from "@/lib/events";
import { requireOrganizer } from "@/lib/organizer";
import { createClient } from "@/lib/supabase/server";

function asInt(raw: string, fallback: number): number {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function asDollarsToCents(raw: string): number {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function asAgeBracket(raw: string): AgeBracket | null {
  return raw === "11U" || raw === "14U" ? raw : null;
}

export async function createEventAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const account = await requireOrganizer(supabase);

  const title = String(formData.get("title") ?? "").trim();
  const startsAtLocal = String(formData.get("starts_at") ?? "").trim();
  const venueName = String(formData.get("venue_name") ?? "").trim();
  const venueAddress = String(formData.get("venue_address") ?? "").trim() || null;
  const bracket = String(formData.get("bracket") ?? "").trim() || "Open";
  const potDollars = String(formData.get("pot_amount_dollars") ?? "");
  const entryDollars = String(formData.get("entry_fee_dollars") ?? "0");
  const potFunder = String(formData.get("pot_funder") ?? "").trim() || null;
  const maxPlayers = asInt(String(formData.get("max_players") ?? "8"), 8);
  const gameLength = asInt(String(formData.get("game_length") ?? "11"), 11);
  const ageBracket = asAgeBracket(String(formData.get("age_bracket") ?? ""));
  const waiverUrl = String(formData.get("waiver_url") ?? "").trim() || null;

  if (!title) throw new Error("Title is required");
  if (!startsAtLocal) throw new Error("Start time is required");
  if (!venueName) throw new Error("Venue is required");

  // `datetime-local` → ISO 8601. Browser-local timezone is implicit; the user
  // is the organizer and is creating an event for their own market, so storing
  // the wall-clock time as local-without-offset matches what they typed.
  const startsAt = new Date(startsAtLocal).toISOString();

  const event = await createEvent({
    title,
    startsAt,
    endsAt: null,
    venueName,
    venueAddress,
    bracket,
    potAmountCents: asDollarsToCents(potDollars),
    entryFeeCents: asDollarsToCents(entryDollars),
    potFunder,
    maxPlayers,
    gameLength,
    ageBracket,
    waiverUrl,
    organizerAccountId: account.id,
  });

  redirect(`/organize/${event.slug}`);
}
