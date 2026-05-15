import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { ensureAccount } from "./account";
import type { AccountRow, Database } from "./supabase/types";

function organizerEmails(): string[] {
  const raw = process.env.ORGANIZER_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isOrganizerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return organizerEmails().includes(email.toLowerCase());
}

/**
 * Resolves the current organizer account. Redirects to `/pot` when:
 *   - no session
 *   - session email is not on the ORGANIZER_EMAILS allowlist
 *
 * Returns the AccountRow so the caller can use `account.id` as
 * `organizer_account_id` and as the filter for "events I organize".
 */
export async function requireOrganizer(supabase: SupabaseClient<Database>): Promise<AccountRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email;
  if (!email) redirect("/organize/sign-in");
  if (!isOrganizerEmail(email)) redirect("/pot");
  return ensureAccount(supabase);
}
