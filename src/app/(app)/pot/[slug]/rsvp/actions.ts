"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { ensureAccount } from "@/lib/account";
import { getEventWithRoster } from "@/lib/events";
import { createCheckoutSession } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const POSTGRES_UNIQUE_VIOLATION = "23505";

/**
 * Phase 1 RSVP. Resolves (or creates) the player identity, records an RSVP with
 * `payment_status='intent'` — the Stripe charge is stubbed (see src/lib/stripe.ts)
 * — and redirects to the confirmation page.
 */
export async function rsvpAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const existingPlayerId = String(formData.get("playerId") ?? "").trim();
  const playerName = String(formData.get("playerName") ?? "").trim();
  const duprId = String(formData.get("duprId") ?? "").trim();

  if (!slug) throw new Error("Missing event slug");

  const supabase = await createClient();
  const account = await ensureAccount(supabase);

  const data = await getEventWithRoster(slug);
  if (!data) throw new Error("Event not found");
  const { event, confirmedCount } = data;

  // 1. Resolve the player identity.
  let playerId: string;
  if (existingPlayerId) {
    playerId = existingPlayerId;
  } else {
    if (!playerName) throw new Error("Player name is required");
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .insert({ display_name: playerName, dupr_id: duprId || null })
      .select("id")
      .single();
    if (playerErr) throw playerErr;
    playerId = player.id;

    const { error: linkErr } = await supabase.from("player_account_links").insert({
      account_id: account.id,
      player_id: playerId,
      link_type: "primary",
    });
    if (linkErr) throw linkErr;
  }

  // 2. Already RSVP'd this player? Skip straight to the confirmation page.
  const { data: existingRsvp } = await supabase
    .from("rsvps")
    .select("id")
    .eq("event_id", event.id)
    .eq("player_id", playerId)
    .maybeSingle();
  if (existingRsvp) redirect(`/pot/${slug}/confirmed`);

  // 3. Payment — stubbed in Phase 1, returns mode 'stubbed' and no charge.
  const checkout = await createCheckoutSession({
    eventSlug: event.slug,
    eventTitle: event.title,
    entryFeeCents: event.entryFeeCents,
    accountId: account.id,
    playerId,
    successUrl: `/pot/${slug}/confirmed`,
    cancelUrl: `/pot/${slug}/rsvp`,
  });

  // 4. Record the RSVP. Confirmed if there's still a seat, otherwise waitlist.
  const isConfirmed = confirmedCount < event.maxPlayers;
  const { error: rsvpErr } = await supabase.from("rsvps").insert({
    event_id: event.id,
    player_id: playerId,
    account_id: account.id,
    payment_status: "intent",
    payment_intent_id: checkout.paymentIntentId ?? null,
    status: isConfirmed ? "confirmed" : "waitlist",
    position: confirmedCount + 1,
  });
  if (rsvpErr) {
    // Someone (or another tab) RSVP'd this player first — treat as success.
    if (rsvpErr.code === POSTGRES_UNIQUE_VIOLATION) {
      redirect(`/pot/${slug}/confirmed`);
    }
    throw rsvpErr;
  }

  // Phase 2: when STRIPE_LIVE is true the checkout returns mode 'redirect' and
  // we'd send the player to Stripe here instead of the confirmation page.
  if (checkout.mode === "redirect" && checkout.url) {
    // External Stripe URL — cast past typed-routes (Phase 2 path).
    redirect(checkout.url as Route);
  }

  redirect(`/pot/${slug}/confirmed`);
}

/** Cancels the current account's RSVP for an event (mirrors Screen 2's button). */
export async function cancelRsvpAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) throw new Error("Missing event slug");

  const supabase = await createClient();
  const account = await ensureAccount(supabase);

  const data = await getEventWithRoster(slug);
  if (!data) throw new Error("Event not found");

  const { error } = await supabase
    .from("rsvps")
    .update({ status: "canceled" })
    .eq("event_id", data.event.id)
    .eq("account_id", account.id);
  if (error) throw error;

  redirect(`/pot/${slug}`);
}
