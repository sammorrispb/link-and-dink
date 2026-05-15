import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  EventRow,
  MatchRow,
  PlayerRow,
  PlayoffPairingRow,
  RoundByeRow,
  RsvpRow,
  TeamRow,
} from "./supabase/types";
import { FORMATS, type FormatCode, type Player, type TournamentEvent } from "./tournament";
import { groupIntoRounds, rowToMatch } from "./tournament-live-shared";

// ──────────────────────────────────────────────────────────────────────────
// Server-only hydration. Pure mappers live in tournament-live-shared.ts so
// client components can import them too. Keep the supabase-touching code here.
// ──────────────────────────────────────────────────────────────────────────

export type RosterRow = { rsvp: RsvpRow; player: PlayerRow };

export interface HydratedTournament {
  event: EventRow;
  roster: RosterRow[];
  tournament: TournamentEvent;
  matches: MatchRow[];
  teams: TeamRow[];
  byes: RoundByeRow[];
  pairing: PlayoffPairingRow | null;
}

export async function hydrateTournamentEvent(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<HydratedTournament | null> {
  const { data: eventRow, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (eventErr) throw eventErr;
  if (!eventRow) return null;

  const [rsvpRes, matchRes, teamRes, byeRes, pairingRes] = await Promise.all([
    supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", eventRow.id)
      .eq("status", "confirmed")
      .order("position", { ascending: true, nullsFirst: false }),
    supabase
      .from("matches")
      .select("*")
      .eq("event_id", eventRow.id)
      .order("round", { ascending: true })
      .order("court", { ascending: true }),
    supabase.from("teams").select("*").eq("event_id", eventRow.id),
    supabase.from("round_byes").select("*").eq("event_id", eventRow.id),
    supabase.from("playoff_pairings").select("*").eq("event_id", eventRow.id).maybeSingle(),
  ]);

  if (rsvpRes.error) throw rsvpRes.error;
  if (matchRes.error) throw matchRes.error;
  if (teamRes.error) throw teamRes.error;
  if (byeRes.error) throw byeRes.error;
  if (pairingRes.error) throw pairingRes.error;

  const rsvps = (rsvpRes.data ?? []) as RsvpRow[];
  const matches = (matchRes.data ?? []) as MatchRow[];
  const teams = (teamRes.data ?? []) as TeamRow[];
  const byes = (byeRes.data ?? []) as RoundByeRow[];
  const pairing = (pairingRes.data ?? null) as PlayoffPairingRow | null;

  const playerIds = [...new Set(rsvps.map((r) => r.player_id))];
  const playerById = new Map<string, PlayerRow>();
  if (playerIds.length > 0) {
    const { data: playerRows, error: playerErr } = await supabase
      .from("players")
      .select("*")
      .in("id", playerIds);
    if (playerErr) throw playerErr;
    for (const p of (playerRows ?? []) as PlayerRow[]) playerById.set(p.id, p);
  }

  const roster: RosterRow[] = rsvps.map((rsvp) => ({
    rsvp,
    player:
      playerById.get(rsvp.player_id) ??
      ({
        id: rsvp.player_id,
        display_name: "Player",
        dupr_id: null,
        dupr_rating: null,
        dupr_reliability: null,
        dupr_synced_at: null,
        ld_rating: null,
        ld_bracket: null,
        eval_status: null,
        eval_coach_account_id: null,
        eval_date: null,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString(),
      } as PlayerRow),
  }));

  const teamById = new Map<string, TeamRow>(teams.map((t) => [t.id, t]));
  const engineMatches = matches.map((m) => rowToMatch(m, teamById));
  const rounds = groupIntoRounds(engineMatches);

  const players: Player[] = roster.map(({ player }, i) => ({
    id: player.id,
    name: player.display_name,
    seat: i + 1,
  }));

  const format = eventRow.format as FormatCode;
  const tournament: TournamentEvent = {
    players,
    rounds,
    format,
    hasPlayoffs: Boolean(FORMATS[format]?.bracket),
  };

  return { event: eventRow, roster, tournament, matches, teams, byes, pairing };
}

// Re-export the pure helpers from this module so existing server-side imports
// (actions.ts) keep working with a single import path.
export {
  buildTeamLookup,
  groupIntoRounds,
  matchToInsert,
  rowToMatch,
  teamPlayerKey,
} from "./tournament-live-shared";
