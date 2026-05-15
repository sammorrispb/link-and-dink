import { generateRoundRobin } from "./round-robin";
import type { GenerateOptions, GenerateResult, Match, Player, PlayerId, Round } from "./types";

function splitPools(ids: PlayerId[]): PlayerId[][] {
  const n = ids.length;
  if (n === 10) return [ids.slice(0, 5), ids.slice(5)];
  if (n === 12) return [ids.slice(0, 4), ids.slice(4, 8), ids.slice(8, 12)];
  if (n === 16) {
    return [ids.slice(0, 4), ids.slice(4, 8), ids.slice(8, 12), ids.slice(12, 16)];
  }
  if (n === 17) return [ids.slice(0, 9), ids.slice(9)];
  if (n === 18) return [ids.slice(0, 9), ids.slice(9)];
  const poolSize = n % 4 === 0 ? 4 : 5;
  const pools: PlayerId[][] = [];
  for (let i = 0; i < n; i += poolSize) pools.push(ids.slice(i, i + poolSize));
  return pools;
}

export function generatePoolPlayoff(players: Player[], opts: GenerateOptions = {}): GenerateResult {
  const ids = players.map((p) => p.id);
  const courts = opts.courts ?? Math.max(2, Math.floor(players.length / 4));
  const pools = splitPools(ids);

  const roundsByIndex: Round[] = [];
  pools.forEach((poolIds, pi) => {
    const subPlayers: Player[] = poolIds.map((id) => ({ id }));
    const sub = generateRoundRobin(subPlayers, { courts: 99 });
    sub.rounds.forEach((rd, ri) => {
      rd.matches.forEach((m: Match) => {
        m.pool = String.fromCharCode(65 + pi);
        m.id = `p${pi + 1}r${ri + 1}m${m.court}`;
      });
      if (!roundsByIndex[ri]) {
        roundsByIndex[ri] = {
          number: ri + 1,
          label: `Pool Round ${ri + 1}`,
          matches: [],
        };
      }
      roundsByIndex[ri].matches.push(...rd.matches);
    });
  });

  for (const rd of roundsByIndex) {
    rd.matches.forEach((m, idx) => {
      m.court = (idx % courts) + 1;
    });
  }

  return { rounds: roundsByIndex, pools, hasPlayoffs: true };
}

export const POOL_PLAYOFF_VALID_COUNTS = [10, 12, 16, 17, 18];
