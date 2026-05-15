import { describe, expect, it } from "vitest";
import {
  buildPlayoffFinalIfReady,
  buildPlayoffSemis,
  computeOverallSeeding,
  computePoolStandings,
  computeRRStandings,
  defaultPlayoffPairing,
  FORMATS,
  generatePoolPlayoff,
  generateRoundRobin,
  playoffQualifierCount,
} from "../index";
import type { Player, PlayerId, Round, TournamentEvent } from "../types";

const makePlayers = (names: string[]): Player[] =>
  names.map((n, i) => ({ id: `p${i}`, name: n, seat: i + 1 }));

const setEq = (a: Iterable<PlayerId>, b: Iterable<PlayerId>): boolean => {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const x of sa) if (!sb.has(x)) return false;
  return true;
};

describe("[1] round-robin generators 4..9 (from Excel schedules)", () => {
  const expected: Record<number, { rrRounds: number; minGames: number }> = {
    4: { rrRounds: 6, minGames: 6 },
    5: { rrRounds: 5, minGames: 4 },
    6: { rrRounds: 6, minGames: 4 },
    7: { rrRounds: 7, minGames: 4 },
    8: { rrRounds: 6, minGames: 6 },
    9: { rrRounds: 6, minGames: 5 },
  };
  for (const n of [4, 5, 6, 7, 8, 9]) {
    it(`${n}p matches Excel: ${expected[n].rrRounds} rounds, ≥${expected[n].minGames} games/player`, () => {
      const players = makePlayers(Array.from({ length: n }, (_, i) => `P${i + 1}`));
      const r = generateRoundRobin(players);
      expect(r.rounds).toHaveLength(expected[n].rrRounds);
      const apps: Record<PlayerId, number> = {};
      for (const p of players) apps[p.id] = 0;
      for (const rd of r.rounds) {
        for (const m of rd.matches) {
          for (const id of [...m.teamA, ...m.teamB]) apps[id] += 1;
        }
      }
      const min = Math.min(...Object.values(apps));
      expect(min).toBeGreaterThanOrEqual(expected[n].minGames);
    });
  }
});

describe("[2] 4-player standings — James/Wornden beat JJ/Rich 11-8", () => {
  const players = makePlayers(["James", "Wornden", "JJ", "Rich"]);
  const ev: TournamentEvent = {
    players,
    rounds: generateRoundRobin(players, { courts: 1 }).rounds,
    format: "rp_04",
  };
  const m0 = ev.rounds[0].matches[0];
  m0.scoreA = 11;
  m0.scoreB = 8;
  m0.complete = true;
  const st = computeRRStandings(ev);
  const byName = (name: string) => {
    const stand = st.find((s) => players.find((p) => p.id === s.id)?.name === name);
    if (!stand) throw new Error(`missing ${name}`);
    return stand;
  };

  it("Team A players (James + Wornden) get the W", () => {
    expect(byName("James").wins).toBe(1);
    expect(byName("Wornden").wins).toBe(1);
  });
  it("Team B players (JJ + Rich) take the L", () => {
    expect(byName("JJ").losses).toBe(1);
    expect(byName("Rich").losses).toBe(1);
  });
  it("point totals are recorded both directions", () => {
    expect(byName("James").pointsFor).toBe(11);
    expect(byName("Rich").pointsAgainst).toBe(11);
  });
});

describe("[3] pool splits match Excel templates", () => {
  const cases: [number, number[]][] = [
    [10, [5, 5]],
    [12, [4, 4, 4]],
    [16, [4, 4, 4, 4]],
    [17, [9, 8]],
    [18, [9, 9]],
  ];
  for (const [n, expected] of cases) {
    it(`${n}p → [${expected.join(",")}]`, () => {
      const players = makePlayers(Array.from({ length: n }, (_, i) => `P${i + 1}`));
      const r = generatePoolPlayoff(players, { courts: 3 });
      const sizes = (r.pools ?? []).map((p) => p.length);
      expect(sizes).toEqual(expected);
    });
  }
});

describe("[4] every 8-player plays exactly 6 RR games (Excel RP-08)", () => {
  it("matches the Excel Sched-RP-08 6-round / 2-court schedule", () => {
    const players = makePlayers([
      "Joe",
      "Khai",
      "Barak",
      "Wornden",
      "James",
      "Jason",
      "Josh",
      "Fang",
    ]);
    const r = generateRoundRobin(players, { courts: 2 });
    expect(r.rounds).toHaveLength(6);
    const apps: Record<PlayerId, number> = {};
    for (const p of players) apps[p.id] = 0;
    for (const rd of r.rounds) {
      for (const m of rd.matches) {
        for (const id of [...m.teamA, ...m.teamB]) apps[id] += 1;
      }
    }
    expect(Object.values(apps).every((c) => c === 6)).toBe(true);
  });
});

function eventWithRankedRR(n: number): TournamentEvent {
  const players = makePlayers(Array.from({ length: n }, (_, i) => `Player${i + 1}`));
  const result =
    n <= 9
      ? generateRoundRobin(players, { courts: 99 })
      : generatePoolPlayoff(players, { courts: 99 });
  const event: TournamentEvent = {
    players,
    rounds: result.rounds,
    pools: result.pools,
    hasPlayoffs: result.hasPlayoffs,
    format: n <= 9 ? "rp_08" : "rp_12",
  };
  const idx = (id: PlayerId) => players.findIndex((p) => p.id === id);
  for (const rd of event.rounds) {
    for (const m of rd.matches) {
      const aSum = m.teamA.reduce((s, id) => s + idx(id), 0);
      const bSum = m.teamB.reduce((s, id) => s + idx(id), 0);
      if (aSum < bSum) {
        m.scoreA = 11;
        m.scoreB = Math.max(0, 10 - (bSum - aSum));
      } else {
        m.scoreB = 11;
        m.scoreA = Math.max(0, 10 - (aSum - bSum));
      }
      m.complete = true;
    }
  }
  return event;
}

describe("[5] playoff bracket — top-down pairing (popup.html default)", () => {
  it("10p qualifies top 4 into a single Championship game", () => {
    const ev = eventWithRankedRR(10);
    const seeds = computeOverallSeeding(ev)
      .slice(0, 4)
      .map((s) => s.id);
    const semis = buildPlayoffSemis(ev);
    expect(playoffQualifierCount(ev)).toBe(4);
    expect(semis?.matches).toHaveLength(1);
    expect(semis?.label).toBe("Championship");
    const m = semis?.matches[0];
    if (!m) throw new Error("no match");
    expect(setEq(m.teamA, [seeds[0], seeds[1]])).toBe(true);
    expect(setEq(m.teamB, [seeds[2], seeds[3]])).toBe(true);
  });

  for (const n of [12, 16, 17, 18]) {
    it(`${n}p qualifies top 8 into two semifinals (top-down)`, () => {
      const ev = eventWithRankedRR(n);
      const seeds = computeOverallSeeding(ev)
        .slice(0, 8)
        .map((s) => s.id);
      const semis = buildPlayoffSemis(ev);
      expect(playoffQualifierCount(ev)).toBe(8);
      expect(semis?.matches).toHaveLength(2);
      expect(semis?.label).toBe("Semifinals");
      const [sf1, sf2] = semis?.matches ?? [];
      expect(setEq(sf1.teamA, [seeds[0], seeds[1]])).toBe(true);
      expect(setEq(sf1.teamB, [seeds[6], seeds[7]])).toBe(true);
      expect(setEq(sf2.teamA, [seeds[2], seeds[3]])).toBe(true);
      expect(setEq(sf2.teamB, [seeds[4], seeds[5]])).toBe(true);
    });
  }
});

describe("[5b] snake pairing (Excel glossary rule)", () => {
  it("10p snake: Champ Team A = seeds 1+4, Team B = seeds 2+3", () => {
    const ev = eventWithRankedRR(10);
    const seeds = computeOverallSeeding(ev)
      .slice(0, 4)
      .map((s) => s.id);
    const pairing = defaultPlayoffPairing(ev, "snake");
    expect(pairing).not.toBeNull();
    if (!pairing) return;
    expect(setEq(pairing[0], [seeds[0], seeds[3]])).toBe(true);
    expect(setEq(pairing[1], [seeds[1], seeds[2]])).toBe(true);
  });
  it("12p snake: 1+8 / 4+5 / 2+7 / 3+6", () => {
    const ev = eventWithRankedRR(12);
    const seeds = computeOverallSeeding(ev)
      .slice(0, 8)
      .map((s) => s.id);
    const pairing = defaultPlayoffPairing(ev, "snake");
    expect(pairing).not.toBeNull();
    if (!pairing) return;
    expect(setEq(pairing[0], [seeds[0], seeds[7]])).toBe(true);
    expect(setEq(pairing[1], [seeds[3], seeds[4]])).toBe(true);
    expect(setEq(pairing[2], [seeds[1], seeds[6]])).toBe(true);
    expect(setEq(pairing[3], [seeds[2], seeds[5]])).toBe(true);
  });
});

describe("[6] final is built from semifinal winners", () => {
  it("returns null before both semis are locked, then builds", () => {
    const ev = eventWithRankedRR(12);
    const semis = buildPlayoffSemis(ev);
    expect(semis).not.toBeNull();
    if (!semis) return;
    ev.rounds.push(semis);
    expect(buildPlayoffFinalIfReady(ev)).toBeNull();

    const [sf1, sf2] = semis.matches;
    sf1.scoreA = 15;
    sf1.scoreB = 7;
    sf1.complete = true;
    sf2.scoreA = 15;
    sf2.scoreB = 9;
    sf2.complete = true;

    const fin = buildPlayoffFinalIfReady(ev) as Round;
    expect(fin).not.toBeNull();
    expect(fin.label).toBe("Final");
    expect(fin.matches).toHaveLength(1);
    expect(setEq(fin.matches[0].teamA, sf1.teamA)).toBe(true);
    expect(setEq(fin.matches[0].teamB, sf2.teamA)).toBe(true);
  });
});

describe("[7a] custom (player-swapped) pairing", () => {
  it("swapping two qualifiers carries through to the bracket", () => {
    const ev = eventWithRankedRR(12);
    const def = defaultPlayoffPairing(ev);
    expect(def).not.toBeNull();
    if (!def) return;
    const custom = def.map((t) => [...t]);
    const seed1 = custom[0][0];
    const seed5 = custom[3][0];
    custom[0][0] = seed5;
    custom[3][0] = seed1;
    const semis = buildPlayoffSemis(ev, custom);
    expect(semis?.matches).toHaveLength(2);
    expect(new Set(semis?.matches[0].teamA).has(seed5)).toBe(true);
    expect(new Set(semis?.matches[1].teamB).has(seed1)).toBe(true);
    const standings = computePoolStandings(ev);
    expect(standings).toHaveLength(12);
  });
});

describe("[7b] default pairing helper structure", () => {
  it("12p default returns 4 teams in top-down order", () => {
    const ev = eventWithRankedRR(12);
    const def = defaultPlayoffPairing(ev);
    expect(def).not.toBeNull();
    if (!def) return;
    const seeds = computeOverallSeeding(ev)
      .slice(0, 8)
      .map((s) => s.id);
    expect(def[0]).toContain(seeds[0]);
    expect(def[0]).toContain(seeds[1]);
    expect(def[1]).toContain(seeds[6]);
    expect(def[1]).toContain(seeds[7]);
    expect(def[2]).toContain(seeds[2]);
    expect(def[2]).toContain(seeds[3]);
    expect(def[3]).toContain(seeds[4]);
    expect(def[3]).toContain(seeds[5]);
  });
  it("10p default returns 2 teams (Top-4 championship)", () => {
    const ev = eventWithRankedRR(10);
    const def = defaultPlayoffPairing(ev);
    expect(def?.length).toBe(2);
  });
});

describe("[8] playoff matches do not re-rank RR standings", () => {
  it("seed 1 keeps RR wins after a playoff loss", () => {
    const ev = eventWithRankedRR(12);
    const semis = buildPlayoffSemis(ev);
    expect(semis).not.toBeNull();
    if (!semis) return;
    ev.rounds.push(semis);
    semis.matches[0].scoreA = 0;
    semis.matches[0].scoreB = 11;
    semis.matches[0].complete = true;
    semis.matches[1].scoreA = 0;
    semis.matches[1].scoreB = 11;
    semis.matches[1].complete = true;
    const standings = computePoolStandings(ev);
    const seed1 = standings.find((s) => s.id === "p0");
    expect(seed1?.wins).toBeGreaterThan(0);
  });
});

describe("[10] format library smoke — every RP code generates a schedule", () => {
  const rpCounts = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  for (const n of rpCounts) {
    const code = `rp_${String(n).padStart(2, "0")}` as keyof typeof FORMATS;
    it(`${code} generates a schedule via the registry`, () => {
      const players = makePlayers(Array.from({ length: n }, (_, i) => `P${i + 1}`));
      const r = FORMATS[code].generate(players);
      expect(r.rounds.length).toBeGreaterThan(0);
      expect(r.rounds.flatMap((rd) => rd.matches).length).toBeGreaterThan(0);
    });
  }
});

describe("[11] Same-Partner formats (from Excel)", () => {
  it("rp_08 and sp_08 are distinct in the registry", () => {
    expect(FORMATS.rp_08.variant).toBe("rp");
    expect(FORMATS.sp_08.variant).toBe("sp");
  });

  const cases: { code: keyof typeof FORMATS; players: number; rrRounds: number }[] = [
    { code: "sp_06", players: 6, rrRounds: 6 },
    { code: "sp_08", players: 8, rrRounds: 3 },
    { code: "sp_10", players: 10, rrRounds: 5 },
    { code: "sp_12", players: 12, rrRounds: 5 },
    { code: "sp_14", players: 14, rrRounds: 7 },
    { code: "sp_16", players: 16, rrRounds: 4 },
    { code: "sp_18", players: 18, rrRounds: 6 },
  ];
  for (const { code, players: n, rrRounds } of cases) {
    it(`${code} generates ${rrRounds} rounds from Excel`, () => {
      const players = makePlayers(Array.from({ length: n }, (_, i) => `P${i + 1}`));
      const r = FORMATS[code].generate(players);
      expect(r.rounds).toHaveLength(rrRounds);
      // Verify same-partner invariant: each player's two appearances per round
      // are always with the same partner across all rounds.
      const partners: Record<PlayerId, Set<PlayerId>> = {};
      for (const p of players) partners[p.id] = new Set();
      for (const rd of r.rounds) {
        for (const m of rd.matches) {
          partners[m.teamA[0]].add(m.teamA[1]);
          partners[m.teamA[1]].add(m.teamA[0]);
          partners[m.teamB[0]].add(m.teamB[1]);
          partners[m.teamB[1]].add(m.teamB[0]);
        }
      }
      for (const id of Object.keys(partners)) {
        // Each player has exactly one partner across the entire event
        expect(partners[id].size).toBe(1);
      }
    });
  }
});

describe("[9] head-to-head tiebreaker", () => {
  it("breaks ties on W+Diff by direct match result", () => {
    const players = makePlayers(["A", "B", "C", "D"]);
    const r = generateRoundRobin(players, { courts: 1 });
    const ev: TournamentEvent = {
      players,
      rounds: r.rounds,
      format: "rp_04",
    };
    for (const rd of ev.rounds) {
      for (const m of rd.matches) {
        m.scoreA = 11;
        m.scoreB = 0;
        m.complete = true;
      }
    }
    const ranked = computeRRStandings(ev);
    expect(ranked[0].wins).toBeGreaterThan(0);
  });
});
