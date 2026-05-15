// Pure DB ↔ engine glue. Safe to import from client components.
// Anything that needs a supabase client (hydration, writes) lives in
// tournament-live.ts (`import "server-only"`).

import type { Database, MatchRow, TeamRow } from "./supabase/types";
import type { Match as EngineMatch, MatchStage, Round } from "./tournament";

export function rowToMatch(row: MatchRow, teamById: Map<string, TeamRow>): EngineMatch {
  const teamA: string[] = [];
  const teamB: string[] = [];
  if (row.team_a_id && row.team_b_id) {
    const tA = teamById.get(row.team_a_id);
    const tB = teamById.get(row.team_b_id);
    if (tA) teamA.push(tA.player1_id, tA.player2_id);
    if (tB) teamB.push(tB.player1_id, tB.player2_id);
  } else {
    if (row.team_a_player1_id) teamA.push(row.team_a_player1_id);
    if (row.team_a_player2_id) teamA.push(row.team_a_player2_id);
    if (row.team_b_player1_id) teamB.push(row.team_b_player1_id);
    if (row.team_b_player2_id) teamB.push(row.team_b_player2_id);
  }
  const stage = row.stage as MatchStage;
  return {
    id: row.id,
    round: row.round,
    court: row.court,
    pool: row.pool ?? undefined,
    stage,
    isPlayoff: stage !== "rr",
    teamA,
    teamB,
    scoreA: row.team_a_score,
    scoreB: row.team_b_score,
    complete: row.locked_at != null,
  };
}

type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"];

export function matchToInsert(
  eventId: string,
  m: EngineMatch,
  teamLookup?: Map<string, string>,
): MatchInsert {
  const base: MatchInsert = {
    event_id: eventId,
    round: m.round,
    court: m.court,
    stage: m.stage,
    pool: m.pool ?? null,
    team_a_score: m.scoreA,
    team_b_score: m.scoreB,
  };

  if (teamLookup) {
    const tA = teamLookup.get(teamPlayerKey(m.teamA));
    const tB = teamLookup.get(teamPlayerKey(m.teamB));
    if (tA && tB) {
      return { ...base, team_a_id: tA, team_b_id: tB };
    }
  }

  return {
    ...base,
    team_a_player1_id: m.teamA[0] ?? null,
    team_a_player2_id: m.teamA[1] ?? null,
    team_b_player1_id: m.teamB[0] ?? null,
    team_b_player2_id: m.teamB[1] ?? null,
  };
}

export function teamPlayerKey(playerIds: readonly string[]): string {
  return [...playerIds].sort().join("|");
}

export function buildTeamLookup(teams: TeamRow[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const t of teams) {
    lookup.set(teamPlayerKey([t.player1_id, t.player2_id]), t.id);
  }
  return lookup;
}

export function groupIntoRounds(matches: EngineMatch[]): Round[] {
  const byRound = new Map<number, EngineMatch[]>();
  for (const m of matches) {
    const arr = byRound.get(m.round) ?? [];
    arr.push(m);
    byRound.set(m.round, arr);
  }
  const nums = [...byRound.keys()].sort((a, b) => a - b);
  return nums.map((num) => {
    const ms = (byRound.get(num) ?? []).sort((a, b) => a.court - b.court);
    const allPlayoff = ms.length > 0 && ms.every((m) => m.isPlayoff);
    return {
      number: num,
      label: roundLabel(num, ms, allPlayoff),
      matches: ms,
      isPlayoff: allPlayoff,
    };
  });
}

function roundLabel(_num: number, matches: EngineMatch[], allPlayoff: boolean): string {
  if (allPlayoff) {
    const stage = matches[0]?.stage;
    if (stage === "championship" || stage === "final") return "Final";
    if (stage === "semifinal") return "Semifinals";
    if (stage === "quarterfinal") return "Quarterfinals";
  }
  return matches.some((m) => m.pool) ? `Pool Round ${_num}` : `Round ${_num}`;
}
