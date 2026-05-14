import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountRow, Database, PlayerRow } from "./supabase/types";

/**
 * Returns the account row for the current auth user, creating it on first
 * sign-in (account-claiming). Must be called with the RLS-enforced server
 * client — the insert is governed by the accounts_insert_own policy.
 */
export async function ensureAccount(supabase: SupabaseClient<Database>): Promise<AccountRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing, error: selectErr } = await supabase
    .from("accounts")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (selectErr) throw selectErr;
  if (existing) return existing;

  const { data: created, error: insertErr } = await supabase
    .from("accounts")
    .insert({
      auth_user_id: user.id,
      email: user.email ?? null,
      display_name: user.email ? user.email.split("@")[0] : null,
    })
    .select("*")
    .single();
  if (insertErr) throw insertErr;
  return created;
}

/** The players linked to an account (a parent may manage several). */
export async function getLinkedPlayers(
  supabase: SupabaseClient<Database>,
  accountId: string,
): Promise<PlayerRow[]> {
  const { data: links, error: linkErr } = await supabase
    .from("player_account_links")
    .select("player_id")
    .eq("account_id", accountId);
  if (linkErr) throw linkErr;

  const ids = (links ?? []).map((l) => l.player_id);
  if (ids.length === 0) return [];

  const { data: players, error: playerErr } = await supabase
    .from("players")
    .select("*")
    .in("id", ids);
  if (playerErr) throw playerErr;
  return players ?? [];
}
