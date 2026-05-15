import { RP_SCHEDULES } from "./schedules";
import type { GenerateOptions, GenerateResult, Match, Player, PlayerId, Round } from "./types";

type RawMatch = { teamA: PlayerId[]; teamB: PlayerId[] };

const BYE = "__BYE__" as PlayerId;

export function rrDoublesGeneric(ids: PlayerId[]): RawMatch[][] {
  const isOdd = ids.length % 2 === 1;
  const arr = isOdd ? [...ids, BYE] : [...ids];
  const m = arr.length;
  const rounds: RawMatch[][] = [];
  for (let r = 0; r < m - 1; r++) {
    const matches: RawMatch[] = [];
    const pairings: PlayerId[][] = [];
    for (let i = 0; i < m / 2; i++) {
      const a = arr[i];
      const b = arr[m - 1 - i];
      if (a !== BYE && b !== BYE) pairings.push([a, b]);
    }
    for (let i = 0; i + 1 < pairings.length; i += 2) {
      const [p1a, p1b] = pairings[i];
      const [p2a, p2b] = pairings[i + 1];
      matches.push({ teamA: [p1a, p2a], teamB: [p1b, p2b] });
    }
    if (matches.length) rounds.push(matches);
    const rest = arr.slice(1);
    rest.unshift(rest.pop() as PlayerId);
    for (let i = 0; i < rest.length; i++) arr[i + 1] = rest[i];
  }
  return rounds;
}

function rawFromSchedule(ids: PlayerId[]): RawMatch[][] | null {
  const code = `rp_${String(ids.length).padStart(2, "0")}`;
  const sched = RP_SCHEDULES[code];
  if (!sched) return null;
  // Excel schedule numbers are 1-indexed player slots.
  return sched.schedule.map((round) =>
    round.map((m) => ({
      teamA: [ids[m.a[0] - 1], ids[m.a[1] - 1]],
      teamB: [ids[m.b[0] - 1], ids[m.b[1] - 1]],
    })),
  );
}

export function generateRoundRobin(players: Player[], opts: GenerateOptions = {}): GenerateResult {
  const ids = players.map((p) => p.id);
  const raw = rawFromSchedule(ids) ?? rrDoublesGeneric(ids);
  // Default court count comes from the Excel schedule when available.
  const code = `rp_${String(ids.length).padStart(2, "0")}`;
  const schedCourts = RP_SCHEDULES[code]?.courts;
  const courts = opts.courts ?? schedCourts ?? (players.length >= 6 ? 2 : 1);
  const rounds: Round[] = raw.map((roundMatches, ri) => ({
    number: ri + 1,
    label: `Round ${ri + 1}`,
    matches: roundMatches.slice(0, courts).map<Match>((m, ci) => ({
      id: `r${ri + 1}c${ci + 1}`,
      round: ri + 1,
      court: ci + 1,
      stage: "rr",
      teamA: m.teamA,
      teamB: m.teamB,
      scoreA: null,
      scoreB: null,
      complete: false,
    })),
  }));
  return { rounds };
}

export const ROUND_ROBIN_VALID_COUNTS = [4, 5, 6, 7, 8, 9];

export function byesForCount(n: number): number[][] {
  const code = `rp_${String(n).padStart(2, "0")}`;
  return RP_SCHEDULES[code]?.byes ?? [];
}
