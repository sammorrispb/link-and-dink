"use server";

import { revalidatePath } from "next/cache";
import { ensureAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  buildPlayoffFinalIfReady,
  buildPlayoffSemis,
  byesForCount,
  FORMATS,
  type FormatCode,
  type PairingRule,
  type PlayerId,
} from "@/lib/tournament";
import {
  buildTeamLookup,
  hydrateTournamentEvent,
  matchToInsert,
  teamPlayerKey,
} from "@/lib/tournament-live";

// ─────────────────────────────────────────────────────────────────────────
// Each action: RLS-enforced client, organizer check (defense in depth on
// top of the migration-0010 RLS), write, revalidate. Returns plain objects
// so the client can show toasts/inline errors.
// ─────────────────────────────────────────────────────────────────────────

type Ctx = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  accountId: string;
  hydrated: NonNullable<Awaited<ReturnType<typeof hydrateTournamentEvent>>>;
};

async function organizerCtx(slug: string): Promise<Ctx> {
  const supabase = await createClient();
  const account = await ensureAccount(supabase);
  const hydrated = await hydrateTournamentEvent(supabase, slug);
  if (!hydrated) throw new Error("Event not found");
  if (hydrated.event.organizer_account_id !== account.id) {
    throw new Error("Not the event organizer");
  }
  return { supabase, accountId: account.id, hydrated };
}

// ─────────────────────────────────────────────────────────────────────────
// startTournamentAction — generates schedule + bye rows. Idempotent.
// ─────────────────────────────────────────────────────────────────────────

export async function startTournamentAction(slug: string): Promise<void> {
  const ctx = await organizerCtx(slug);
  const { supabase, hydrated } = ctx;
  const { event, roster, matches, teams } = hydrated;

  if (matches.length > 0) {
    // Already generated. The Live UI also gates the button, but be idempotent.
    return;
  }

  const format = event.format as FormatCode;
  const formatMod = FORMATS[format];
  if (!formatMod) throw new Error(`Unknown format: ${event.format}`);

  if (roster.length < formatMod.playerCount) {
    throw new Error(
      `${formatMod.name} needs ${formatMod.playerCount} confirmed players; have ${roster.length}.`,
    );
  }

  const players = roster
    .slice(0, formatMod.playerCount)
    .map(({ player }, i) => ({ id: player.id, name: player.display_name, seat: i + 1 }));

  let teamLookup: Map<string, string> | undefined;
  if (formatMod.variant === "sp") {
    if (teams.length < formatMod.playerCount / 2) {
      throw new Error(
        `Same-Partner format ${format} needs ${formatMod.playerCount / 2} team rows; have ${teams.length}. Use the team picker first.`,
      );
    }
    teamLookup = buildTeamLookup(teams);
  }

  // Engine expects pair-ordered players for SP so buildTeams reconstructs the
  // same pair grouping as the teams table. For RP, roster order is what counts.
  const enginePlayers =
    formatMod.variant === "sp"
      ? teams.flatMap((t) => [
          { id: t.player1_id, seat: 0 },
          { id: t.player2_id, seat: 0 },
        ])
      : players;
  const result = formatMod.generate(enginePlayers);

  const inserts = result.rounds.flatMap((round) =>
    round.matches.map((m) => matchToInsert(event.id, m, teamLookup)),
  );

  if (inserts.length === 0) {
    throw new Error("Engine produced 0 matches — refusing to start.");
  }

  const { error: matchErr } = await supabase.from("matches").insert(inserts);
  if (matchErr) throw matchErr;

  // Bye rows (RP only — SP byes are encoded by absence from any round).
  if (formatMod.variant === "rp") {
    const byeRoundsBySeat = byesForCount(formatMod.playerCount);
    const byeRows = byeRoundsBySeat
      .flatMap((seats, ri) =>
        seats.map((seatNum) => ({
          event_id: event.id,
          round: ri + 1,
          player_id: players[seatNum - 1]?.id,
        })),
      )
      .filter(
        (r): r is { event_id: string; round: number; player_id: string } =>
          typeof r.player_id === "string",
      );
    if (byeRows.length > 0) {
      const { error: byeErr } = await supabase.from("round_byes").insert(byeRows);
      if (byeErr) throw byeErr;
    }
  }

  const { error: statusErr } = await supabase
    .from("events")
    .update({ status: "in_progress" })
    .eq("id", event.id);
  if (statusErr) throw statusErr;

  revalidatePath(`/pot/${slug}/live`);
}

// ─────────────────────────────────────────────────────────────────────────
// saveScoreAction — debounced from the client on every score keystroke.
// Refuses to write a locked match.
// ─────────────────────────────────────────────────────────────────────────

export async function saveScoreAction(
  slug: string,
  matchId: string,
  scoreA: number | null,
  scoreB: number | null,
): Promise<void> {
  const ctx = await organizerCtx(slug);
  const { supabase, hydrated } = ctx;
  const target = hydrated.matches.find((m) => m.id === matchId);
  if (!target) throw new Error("Match not found");
  if (target.locked_at) throw new Error("Match is locked");

  const { error } = await supabase
    .from("matches")
    .update({ team_a_score: scoreA, team_b_score: scoreB })
    .eq("id", matchId)
    .is("locked_at", null);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────
// lockMatchAction — sets locked_at + locked_by. Server re-validates canLock.
// ─────────────────────────────────────────────────────────────────────────

export async function lockMatchAction(slug: string, matchId: string): Promise<void> {
  const ctx = await organizerCtx(slug);
  const { supabase, accountId, hydrated } = ctx;
  const target = hydrated.matches.find((m) => m.id === matchId);
  if (!target) throw new Error("Match not found");
  if (target.locked_at) return; // idempotent
  if (target.team_a_score == null || target.team_b_score == null) {
    throw new Error("Both scores required to lock");
  }
  if (target.team_a_score === target.team_b_score) {
    throw new Error("Scores can't be tied");
  }

  const { error } = await supabase
    .from("matches")
    .update({
      locked_at: new Date().toISOString(),
      locked_by_account_id: accountId,
    })
    .eq("id", matchId)
    .is("locked_at", null);
  if (error) throw error;

  revalidatePath(`/pot/${slug}/live`);
}

// ─────────────────────────────────────────────────────────────────────────
// unlockMatchAction — organizer-only edit affordance.
// ─────────────────────────────────────────────────────────────────────────

export async function unlockMatchAction(slug: string, matchId: string): Promise<void> {
  const ctx = await organizerCtx(slug);
  const { supabase } = ctx;

  const { error } = await supabase
    .from("matches")
    .update({ locked_at: null, locked_by_account_id: null })
    .eq("id", matchId);
  if (error) throw error;

  revalidatePath(`/pot/${slug}/live`);
}

// ─────────────────────────────────────────────────────────────────────────
// savePlayoffPairingAction — once partner-pick is finalized, write the
// playoff_pairings row + insert the semi/championship match rows.
// `teamsJson` is the engine's PlayerId[][] shape.
// ─────────────────────────────────────────────────────────────────────────

export async function savePlayoffPairingAction(
  slug: string,
  rule: PairingRule,
  teams: PlayerId[][],
): Promise<void> {
  const ctx = await organizerCtx(slug);
  const { supabase, accountId, hydrated } = ctx;
  const { event, tournament, pairing, teams: teamRows } = hydrated;

  if (pairing) {
    throw new Error("Playoff bracket is already locked");
  }

  const rrMatches = tournament.rounds.flatMap((r) => r.matches.filter((m) => !m.isPlayoff));
  if (rrMatches.length === 0 || !rrMatches.every((m) => m.complete)) {
    throw new Error("Lock every round-robin match before drawing playoffs");
  }

  const qualifierCount = teams.length === 2 ? 4 : 8;
  const newRound = buildPlayoffSemis(tournament, teams, rule);
  if (!newRound) throw new Error("Engine refused the pairing");

  // 1. playoff_pairings row
  const { error: pairingErr } = await supabase.from("playoff_pairings").insert({
    event_id: event.id,
    rule,
    qualifier_count: qualifierCount,
    teams_json:
      teams as unknown as Database["public"]["Tables"]["playoff_pairings"]["Insert"]["teams_json"],
    locked_by_account_id: accountId,
  });
  if (pairingErr) throw pairingErr;

  // 2. match rows for the new round (offset by existing round count)
  const playoffOffset = tournament.rounds.length;
  const formatMod = FORMATS[event.format as FormatCode];
  const teamLookup = formatMod?.variant === "sp" ? buildTeamLookup(teamRows) : undefined;

  const inserts = newRound.matches.map((m) => ({
    ...matchToInsert(event.id, { ...m, round: playoffOffset + 1 }, teamLookup),
  }));

  const { error: matchErr } = await supabase.from("matches").insert(inserts);
  if (matchErr) throw matchErr;

  revalidatePath(`/pot/${slug}/live`);
}

// ─────────────────────────────────────────────────────────────────────────
// generateFinalAction — once both semis are locked, insert the final.
// ─────────────────────────────────────────────────────────────────────────

export async function generateFinalAction(slug: string): Promise<void> {
  const ctx = await organizerCtx(slug);
  const { supabase, hydrated } = ctx;
  const { event, tournament, teams: teamRows } = hydrated;

  const final = buildPlayoffFinalIfReady(tournament);
  if (!final) throw new Error("Lock both semifinal scores first");

  const playoffOffset = tournament.rounds.length;
  const formatMod = FORMATS[event.format as FormatCode];
  const teamLookup = formatMod?.variant === "sp" ? buildTeamLookup(teamRows) : undefined;

  const inserts = final.matches.map((m) =>
    matchToInsert(event.id, { ...m, round: playoffOffset + 1 }, teamLookup),
  );
  const { error } = await supabase.from("matches").insert(inserts);
  if (error) throw error;

  revalidatePath(`/pot/${slug}/live`);
}

// ─────────────────────────────────────────────────────────────────────────
// savePreEventTeamsAction — SP only. Records the fixed doubles teams a TD
// chose before generation. Replaces any prior selection (allowed only while
// matches.length === 0).
// ─────────────────────────────────────────────────────────────────────────

export async function savePreEventTeamsAction(
  slug: string,
  pairs: Array<{ player1Id: string; player2Id: string; label?: string }>,
): Promise<void> {
  const ctx = await organizerCtx(slug);
  const { supabase, hydrated } = ctx;
  const { event, matches } = hydrated;

  if (matches.length > 0) {
    throw new Error("Teams can't be edited once the tournament has started");
  }

  const formatMod = FORMATS[event.format as FormatCode];
  if (!formatMod || formatMod.variant !== "sp") {
    throw new Error("Team picker only applies to Same-Partner formats");
  }

  const expected = formatMod.playerCount / 2;
  if (pairs.length !== expected) {
    throw new Error(`${formatMod.name} expects ${expected} teams; got ${pairs.length}`);
  }

  // Validate every player appears exactly once across pairs.
  const seen = new Set<string>();
  for (const p of pairs) {
    if (p.player1Id === p.player2Id) {
      throw new Error("A player can't be paired with themselves");
    }
    if (seen.has(p.player1Id) || seen.has(p.player2Id)) {
      throw new Error("Each player must appear in exactly one team");
    }
    seen.add(p.player1Id);
    seen.add(p.player2Id);
  }

  // Replace: delete existing teams for this event, then insert.
  const { error: delErr } = await supabase.from("teams").delete().eq("event_id", event.id);
  if (delErr) throw delErr;

  const inserts = pairs.map((p, i) => ({
    event_id: event.id,
    player1_id: p.player1Id,
    player2_id: p.player2Id,
    label: p.label ?? `Team ${i + 1}`,
    seed: i + 1,
  }));

  const { error: insErr } = await supabase.from("teams").insert(inserts);
  if (insErr) throw insErr;

  revalidatePath(`/pot/${slug}/live`);
}

// teamPlayerKey is exported here for convenience to clients that mirror the
// lookup logic when building optimistic UI for SP events. Pure helper.
export { teamPlayerKey };
