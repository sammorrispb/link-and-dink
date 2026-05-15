import type { Match, PlayerId, Standing, TournamentEvent } from "./types";

type RawStats = Omit<Standing, "diff" | "seed">;

export function tallyMatches(matches: Match[], playerIds: PlayerId[]): Record<PlayerId, RawStats> {
  const stats: Record<PlayerId, RawStats> = {};
  for (const id of playerIds) {
    stats[id] = {
      id,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      played: 0,
    };
  }
  for (const m of matches) {
    if (m.isPlayoff) continue;
    if (m.scoreA == null || m.scoreB == null) continue;
    const a = Number(m.scoreA);
    const b = Number(m.scoreB);
    if (a === b) continue;
    const aWin = a > b;
    for (const id of m.teamA) {
      const s = stats[id];
      if (!s) continue;
      s.pointsFor += a;
      s.pointsAgainst += b;
      s.played += 1;
      if (aWin) s.wins += 1;
      else s.losses += 1;
    }
    for (const id of m.teamB) {
      const s = stats[id];
      if (!s) continue;
      s.pointsFor += b;
      s.pointsAgainst += a;
      s.played += 1;
      if (!aWin) s.wins += 1;
      else s.losses += 1;
    }
  }
  return stats;
}

function headToHeadWinner(a: RawStats, b: RawStats, matches: Match[]): number {
  let aWins = 0;
  let bWins = 0;
  for (const m of matches) {
    if (m.isPlayoff) continue;
    if (m.scoreA == null || m.scoreB == null) continue;
    const inA = (id: PlayerId) => m.teamA.includes(id);
    const inB = (id: PlayerId) => m.teamB.includes(id);
    const aOnTeamA = inA(a.id) && inB(b.id);
    const aOnTeamB = inA(b.id) && inB(a.id);
    if (!aOnTeamA && !aOnTeamB) continue;
    const teamAScored = Number(m.scoreA);
    const teamBScored = Number(m.scoreB);
    if (teamAScored === teamBScored) continue;
    const aSideWon = aOnTeamA ? teamAScored > teamBScored : teamBScored > teamAScored;
    if (aSideWon) aWins += 1;
    else bWins += 1;
  }
  return bWins - aWins;
}

export function rankStats(statsArray: RawStats[], matches: Match[] = []): Standing[] {
  const sorted = [...statsArray].sort((a, b) => {
    const winDelta = b.wins - a.wins;
    if (winDelta !== 0) return winDelta;
    const h2h = headToHeadWinner(a, b, matches);
    if (h2h !== 0) return h2h;
    const diffDelta = b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst);
    if (diffDelta !== 0) return diffDelta;
    return b.pointsFor - a.pointsFor;
  });
  return sorted.map((s, i) => ({
    ...s,
    diff: s.pointsFor - s.pointsAgainst,
    seed: i + 1,
  }));
}

export function computeRRStandings(event: TournamentEvent): Standing[] {
  const playerIds = event.players.map((p) => p.id);
  const matches = event.rounds.flatMap((r) => r.matches);
  const stats = tallyMatches(matches, playerIds);
  return rankStats(Object.values(stats), matches);
}

export function computePoolStandings(event: TournamentEvent): Standing[] {
  const matches = event.rounds.flatMap((r) => r.matches);
  const byPool: Record<string, Match[]> = {};
  for (const m of matches) {
    if (!m.pool) continue;
    byPool[m.pool] = byPool[m.pool] || [];
    byPool[m.pool].push(m);
  }
  const out: Standing[] = [];
  for (const [pool, poolMatches] of Object.entries(byPool)) {
    const ids = new Set<PlayerId>();
    for (const m of poolMatches) {
      for (const id of m.teamA) ids.add(id);
      for (const id of m.teamB) ids.add(id);
    }
    const stats = tallyMatches(poolMatches, [...ids]);
    const ranked = rankStats(Object.values(stats), poolMatches);
    for (const r of ranked) r.pool = pool;
    out.push(...ranked);
  }
  return out;
}
