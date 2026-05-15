"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rsvpCookieName, verifyRsvpCookie } from "@/lib/tokens";

/**
 * Link the cookie-identified player to the signed-in account. Idempotent —
 * a returning visitor running this twice is a no-op.
 */
export async function claimPlayerAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();

  const cookieStore = await cookies();
  const payload = verifyRsvpCookie(cookieStore.get(rsvpCookieName)?.value);
  if (!payload) redirect(slug ? `/pot/${slug}/rsvp` : "/pot");

  const supabase = await createClient();
  const account = await ensureAccount(supabase);

  // Backfill player.email if missing (so future pre-fills work).
  const sb = createServiceClient();
  if (account.email) {
    await sb
      .from("players")
      .update({ email: account.email })
      .eq("id", payload.playerId)
      .is("email", null);
  }

  // Idempotent link.
  const { data: existingLink } = await sb
    .from("player_account_links")
    .select("id")
    .eq("account_id", account.id)
    .eq("player_id", payload.playerId)
    .maybeSingle();

  if (!existingLink) {
    const { error } = await sb.from("player_account_links").insert({
      account_id: account.id,
      player_id: payload.playerId,
      link_type: "primary",
    });
    if (error) throw error;
  }

  // Backfill rsvp.account_id for this event so organizer dashboards can
  // surface the linked-account view later.
  await sb
    .from("rsvps")
    .update({ account_id: account.id })
    .eq("event_id", payload.eventId)
    .eq("player_id", payload.playerId)
    .is("account_id", null);

  redirect(slug ? `/pot/${slug}/confirmed?claimed=1` : "/pot");
}
