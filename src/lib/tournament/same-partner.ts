import { SP_SCHEDULES } from "./schedules";
import { rankStats, tallyMatches } from "./standings";
import type {
  GenerateOptions,
  GenerateResult,
  Match,
  Player,
  Round,
  Standing,
  Team,
  TournamentEvent,
} from "./types";

/**
 * Build the canonical fixed pairs for an SP-XX event: players come in as
 * [p1, p2, p3, p4, ...] and pair into Team1=(p1,p2), Team2=(p3,p4), etc.
 * The Excel schedule numbers teams 1..N and the engine maps team numbers back
 * to their two PlayerIds at every round.
 */
export function buildTeams(players: Player[]): Team[] {
  if (players.length % 2 !== 0) {
    throw new Error(`Same-Partner requires an even player count; got ${players.length}`);
  }
  const teams: Team[] = [];
  for (let i = 0; i < players.length; i += 2) {
    teams.push({
      id: `t${i / 2 + 1}`,
      player1Id: players[i].id,
      player2Id: players[i + 1].id,
      label: `Team ${i / 2 + 1}`,
    });
  }
  return teams;
}

export function generateSamePartner(players: Player[], opts: GenerateOptions = {}): GenerateResult {
  const code = `sp_${String(players.length).padStart(2, "0")}`;
  const sched = SP_SCHEDULES[code];
  if (!sched) {
    throw new Error(`No Same-Partner schedule for ${players.length} players (code ${code})`);
  }
  const teams = buildTeams(players);
  const courts = opts.courts ?? sched.courts;

  const rounds: Round[] = sched.schedule.map((roundMatches, ri) => ({
    number: ri + 1,
    label:
      ri === sched.schedule.length - 1 && roundMatches.length < (sched.schedule[0]?.length ?? 0)
        ? `Round ${ri + 1}`
        : `Round ${ri + 1}`,
    matches: roundMatches.slice(0, courts).map<Match>((m, ci) => {
      const teamA = teams[m.a - 1];
      const teamB = teams[m.b - 1];
      return {
        id: `r${ri + 1}c${ci + 1}`,
        round: ri + 1,
        court: ci + 1,
        stage: "rr",
        teamA: [teamA.player1Id, teamA.player2Id],
        teamB: [teamB.player1Id, teamB.player2Id],
        scoreA: null,
        scoreB: null,
        complete: false,
      };
    }),
  }));

  return { rounds };
}

/**
 * Same-Partner standings: collapse the per-player tally into per-team rows
 * (both partners always share W/L/PF/PA, so we dedupe).
 */
export function computeSPStandings(
  event: TournamentEvent,
  teams: Team[] = buildTeams(event.players),
): Standing[] {
  const playerIds = event.players.map((p) => p.id);
  const matches = event.rounds.flatMap((r) => r.matches);
  const stats = tallyMatches(matches, playerIds);
  const teamStats = teams.map((t) => {
    const s1 = stats[t.player1Id];
    if (!s1) {
      return {
        id: t.id,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        played: 0,
      };
    }
    return {
      id: t.id,
      wins: s1.wins,
      losses: s1.losses,
      pointsFor: s1.pointsFor,
      pointsAgainst: s1.pointsAgainst,
      played: s1.played,
    };
  });
  return rankStats(teamStats, matches);
}

export const SAME_PARTNER_VALID_COUNTS = [6, 8, 10, 12, 14, 16, 18];
