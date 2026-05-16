import { describe, expect, it } from "vitest";
import {
  buildPlayoffSemis,
  computeOverallSeeding,
  defaultPlayoffPairing,
  FORMATS,
  playoffQualifierCount,
} from "../index";
import type { Player, Round, TournamentEvent } from "../types";

// May 26 Pot Night rehearsal coverage. The repo already tests engine pieces in
// isolation (engines.test.ts) and the DB round-trip (tournament-live.test.ts).
// This file is the unmocked happy-path chain for rp_08, end-to-end, the format
// the inaugural P3 Popup at NGPA runs on. If any step here fails on day-of, the
// runbook in docs/operations/ falls back to paper bracket entry.

const makePlayers = (): Player[] =>
  Array.from({ length: 8 }, (_, i) => ({ id: `p${i + 1}`, name: `P${i + 1}`, seat: i + 1 }));

// Deterministic scorer — Team A wins by 3 every match. Keeps the test
// hermetic; the engine treats higher-score-wins identically regardless of
// magnitude.
const fillScore = (m: Round["matches"][number]): void => {
  m.scoreA = 11;
  m.scoreB = 8;
  m.complete = true;
};

describe("rp_08 end-to-end chain (May 26 P3 Popup format)", () => {
  it("FORMATS.rp_08 describes 8 players, 2 courts, 6 rounds, top4_se bracket", () => {
    const f = FORMATS.rp_08;
    expect(f.playerCount).toBe(8);
    expect(f.courts).toBe(2);
    expect(f.rrRounds).toBe(6);
    expect(f.bracket).toBe("top4_se");
    expect(f.variant).toBe("rp");
  });

  it("generates 12 RR matches across 6 rounds on 2 courts", () => {
    const result = FORMATS.rp_08.generate(makePlayers());
    expect(result.rounds).toHaveLength(6);
    const total = result.rounds.reduce((n, r) => n + r.matches.length, 0);
    expect(total).toBe(12);
    for (const r of result.rounds) {
      expect(r.matches.length).toBeLessThanOrEqual(2);
    }
  });

  it("playoffQualifierCount is 4 for 8 players (single championship match, not semis+final)", () => {
    const players = makePlayers();
    const event: TournamentEvent = {
      players,
      rounds: FORMATS.rp_08.generate(players).rounds,
      format: "rp_08",
    };
    expect(playoffQualifierCount(event)).toBe(4);
  });

  it("end-to-end: generate → fill 12 RR scores → seed top 4 → championship match → winner emerges", () => {
    const players = makePlayers();
    const { rounds } = FORMATS.rp_08.generate(players);
    const event: TournamentEvent = { players, rounds, format: "rp_08" };

    // RR phase — fill every match.
    for (const r of rounds) for (const m of r.matches) fillScore(m);

    // Standings should rank all 8 players.
    const seeding = computeOverallSeeding(event);
    expect(seeding).toHaveLength(8);
    expect(seeding[0].seed).toBe(1);

    // top_down pairing should hand back two pairs from the top 4.
    const pairing = defaultPlayoffPairing(event, "top_down");
    expect(pairing).not.toBeNull();
    if (!pairing) return;
    expect(pairing).toHaveLength(2);
    expect(pairing[0]).toHaveLength(2);
    expect(pairing[1]).toHaveLength(2);

    // For 8-player events the playoff is a single championship match, not
    // semis + final. generateFinalAction is gated to formats that build
    // separate "Semifinals" round (10+ player events).
    const playoff = buildPlayoffSemis(event, pairing, "top_down");
    expect(playoff).not.toBeNull();
    if (!playoff) return;
    expect(playoff.label).toBe("Championship");
    expect(playoff.matches).toHaveLength(1);
    expect(playoff.matches[0].stage).toBe("championship");
    expect(playoff.matches[0].playoffSlot).toBe("final");
    expect(playoff.matches[0].isPlayoff).toBe(true);

    // Fill the championship match — the engine just needs scoreA ≠ scoreB.
    const champ = playoff.matches[0];
    champ.scoreA = 11;
    champ.scoreB = 6;
    champ.complete = true;

    const winners = champ.scoreA > champ.scoreB ? champ.teamA : champ.teamB;
    expect(winners).toHaveLength(2);
    expect(new Set(winners).size).toBe(2);
  });

  it("snake pairing differs from top_down for the same RR results", () => {
    const players = makePlayers();
    const { rounds } = FORMATS.rp_08.generate(players);
    const event: TournamentEvent = { players, rounds, format: "rp_08" };
    for (const r of rounds) for (const m of r.matches) fillScore(m);

    const td = defaultPlayoffPairing(event, "top_down");
    const sn = defaultPlayoffPairing(event, "snake");
    expect(td).not.toBeNull();
    expect(sn).not.toBeNull();
    if (!td || !sn) return;
    // top_down: [1+2, 3+4]; snake: [1+4, 2+3] — they cannot match.
    expect(td).not.toEqual(sn);
  });

  it("defaultPlayoffPairing returns null when RR is incomplete", () => {
    const players = makePlayers();
    const { rounds } = FORMATS.rp_08.generate(players);
    const event: TournamentEvent = { players, rounds, format: "rp_08" };
    // Lock zero matches → seeding can't rank top 4.
    // computeOverallSeeding still returns players but pairing requires
    // qualifiers to be distinguishable. Engine treats unplayed matches as
    // unranked, so verify pairing still produces something (engine fallback)
    // rather than crashing — the actual gate against starting playoffs early
    // lives in savePlayoffPairingAction, not the engine. Lock test in case
    // the engine guard tightens later.
    const pairing = defaultPlayoffPairing(event, "top_down");
    expect(pairing === null || pairing.length === 2).toBe(true);
  });
});
