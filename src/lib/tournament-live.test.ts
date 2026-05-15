import { describe, expect, it } from "vitest";
import type { MatchRow, TeamRow } from "./supabase/types";
import type { Player } from "./tournament";
import { generateRoundRobin, generateSamePartner } from "./tournament";
import {
  buildTeamLookup,
  matchToInsert,
  rowToMatch,
  teamPlayerKey,
} from "./tournament-live-shared";

const EVENT_ID = "00000000-0000-0000-0000-000000000001";

const makePlayers = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `P${i + 1}`,
    seat: i + 1,
  }));

// Pretend a DB INSERT happened: fill in id + timestamps + null defaults.
const fakeMatchRow = (insert: ReturnType<typeof matchToInsert>, id: string): MatchRow => ({
  id,
  event_id: insert.event_id,
  round: insert.round,
  court: insert.court,
  stage: insert.stage,
  pool: insert.pool ?? null,
  team_a_id: insert.team_a_id ?? null,
  team_b_id: insert.team_b_id ?? null,
  team_a_player1_id: insert.team_a_player1_id ?? null,
  team_a_player2_id: insert.team_a_player2_id ?? null,
  team_b_player1_id: insert.team_b_player1_id ?? null,
  team_b_player2_id: insert.team_b_player2_id ?? null,
  team_a_score: insert.team_a_score ?? null,
  team_b_score: insert.team_b_score ?? null,
  submitted_by_account_id: null,
  submitted_at: null,
  confirmed_at: null,
  disputed_at: null,
  resolved_by_account_id: null,
  locked_at: null,
  locked_by_account_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe("teamPlayerKey", () => {
  it("is order-independent so reverse pairs collide", () => {
    expect(teamPlayerKey(["b", "a"])).toBe(teamPlayerKey(["a", "b"]));
  });
});

describe("RP-08 round-trip: engine → matchToInsert → row → rowToMatch", () => {
  const players = makePlayers(8);
  const { rounds } = generateRoundRobin(players);
  const first = rounds[0].matches[0];

  it("preserves teamA/teamB membership and the 4-player XOR shape", () => {
    const insert = matchToInsert(EVENT_ID, first);
    expect(insert.team_a_id).toBeUndefined();
    expect(insert.team_b_id).toBeUndefined();
    expect(insert.team_a_player1_id).toBe(first.teamA[0]);
    expect(insert.team_a_player2_id).toBe(first.teamA[1]);
    expect(insert.team_b_player1_id).toBe(first.teamB[0]);
    expect(insert.team_b_player2_id).toBe(first.teamB[1]);

    const row = fakeMatchRow(insert, "match-uuid");
    const back = rowToMatch(row, new Map());
    expect(back.teamA).toEqual(first.teamA);
    expect(back.teamB).toEqual(first.teamB);
    expect(back.round).toBe(first.round);
    expect(back.court).toBe(first.court);
    expect(back.stage).toBe("rr");
    expect(back.isPlayoff).toBe(false);
    expect(back.complete).toBe(false);
  });

  it("scores survive the round-trip", () => {
    const m = { ...first, scoreA: 11, scoreB: 8 };
    const row = fakeMatchRow(matchToInsert(EVENT_ID, m), "m");
    const back = rowToMatch(row, new Map());
    expect(back.scoreA).toBe(11);
    expect(back.scoreB).toBe(8);
  });

  it("locked_at presence on the row maps to complete=true on the engine match", () => {
    const row = fakeMatchRow(matchToInsert(EVENT_ID, first), "m");
    row.locked_at = new Date().toISOString();
    expect(rowToMatch(row, new Map()).complete).toBe(true);
  });
});

describe("SP-08 round-trip: engine → matchToInsert(teamLookup) → row → rowToMatch", () => {
  const players = makePlayers(8);
  const { rounds } = generateSamePartner(players);
  const first = rounds[0].matches[0];

  // Fake teams to match the engine's buildTeams output (pairs in order).
  const teamRows: TeamRow[] = [
    {
      id: "t-1",
      event_id: EVENT_ID,
      player1_id: "p1",
      player2_id: "p2",
      label: "T1",
      seed: null,
      created_at: "",
    },
    {
      id: "t-2",
      event_id: EVENT_ID,
      player1_id: "p3",
      player2_id: "p4",
      label: "T2",
      seed: null,
      created_at: "",
    },
    {
      id: "t-3",
      event_id: EVENT_ID,
      player1_id: "p5",
      player2_id: "p6",
      label: "T3",
      seed: null,
      created_at: "",
    },
    {
      id: "t-4",
      event_id: EVENT_ID,
      player1_id: "p7",
      player2_id: "p8",
      label: "T4",
      seed: null,
      created_at: "",
    },
  ];
  const lookup = buildTeamLookup(teamRows);
  const teamById = new Map<string, TeamRow>(teamRows.map((t) => [t.id, t]));

  it("inserts use the team FKs and leave player_id columns null", () => {
    const insert = matchToInsert(EVENT_ID, first, lookup);
    expect(insert.team_a_id).toBeTruthy();
    expect(insert.team_b_id).toBeTruthy();
    expect(insert.team_a_player1_id ?? null).toBeNull();
    expect(insert.team_a_player2_id ?? null).toBeNull();
    expect(insert.team_b_player1_id ?? null).toBeNull();
    expect(insert.team_b_player2_id ?? null).toBeNull();
  });

  it("rowToMatch resolves team FKs back into the same 4-player engine teams", () => {
    const insert = matchToInsert(EVENT_ID, first, lookup);
    const row = fakeMatchRow(insert, "m-sp");
    const back = rowToMatch(row, teamById);
    expect(new Set(back.teamA)).toEqual(new Set(first.teamA));
    expect(new Set(back.teamB)).toEqual(new Set(first.teamB));
  });
});
