# Tournament software — design sources & porting plan

Phase 1 shipped the public discovery + stubbed RSVP. Phase 2 is the actual
tournament engine: format generators, live scoring, standings, playoff bracket.
A working prototype already exists outside the repo as a single-file vanilla-JS
app (`artifacts/popup.html`). This folder is the source of truth for porting it
into the Next.js + Supabase codebase.

## Artifacts (vendored under `./artifacts/`)

| File | What it is |
| --- | --- |
| `popup.html` | The working prototype. Single-file, localStorage-backed, mobile-first. 8 screens, 2 format engines, playoff bracket builder, partner-pick UX, season leaderboard, JSON import/export. ~80KB. |
| `8p_tournament_demo.html` | Standalone interactive demo of one 8-player Pot Night with the hardcoded RP-08 schedule from `8 Player Final Final.xlsx`. Live scores → live standings → live partner-pairing matrix. |
| `verify.js` | Node test harness that loads `popup.html`, stubs the DOM, and asserts the engine: RR generators 4–9, pool splits, 8p game count, top-down playoff pairing, final-from-semi-winners, custom pairing swap, playoff-no-rerank. 8 assertion blocks. |
| `tournament_format_rundowns_4-18.xlsx` | The formal playbook. 47 sheets: Cover, Matrix, Glossary, RP-04..RP-18 (15 sheets), SP-06..SP-18 (7 sheets), Sched-* (round-by-round schedules for every format). |

## Format catalogue (from the Excel Matrix)

Planning constant: **17 min/round** (15 play + 2 changeover). All formats meet
a **4-game-per-player minimum**.

### Rotating Partner (RP) — individual scoring

| Code | Players | Courts | Sits/rd | RR rds | Bracket | Total rds | Min games |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RP-04 | 4  | 1 | 0 | 6 | Championship | 7 | 6 |
| RP-05 | 5  | 1 | 1 | 5 | Top-4 (Championship game) | 6 | 4 |
| RP-06 | 6  | 1 | 2 | 6 | Championship | 7 | 4 |
| RP-07 | 7  | 1 | 3 | 7 | Championship | 8 | 4 |
| RP-08 | 8  | 2 | 0 | 6 | Top-4 SE | 8 | 6 |
| RP-09 | 9  | 2 | 1 | 6 | Top-4 SE | 8 | 5 |
| RP-10 | 10 | 2 | 2 | 6 | Top-4 SE | 8 | 4 |
| RP-11 | 11 | 2 | 3 | 7 | Top-4 SE | 9 | 5 |
| RP-12 | 12 | 3 | 0 | 6 | Top-8 SE | 8 | 6 |
| RP-13 | 13 | 3 | 1 | 6 | Top-8 SE | 8 | 5 |
| RP-14 | 14 | 3 | 2 | 6 | Top-8 SE | 8 | 5 |
| RP-15 | 15 | 3 | 3 | 6 | Top-8 SE | 8 | 4 |
| RP-16 | 16 | 4 | 0 | 6 | Top-8 SE | 8 | 6 |
| RP-17 | 17 | 4 | 1 | 6 | Top-8 SE | 8 | 5 |
| RP-18 | 18 | 4 | 2 | 6 | Top-8 SE | 8 | 5 |

### Same Partner (SP) — fixed teams, team scoring

| Code | Players | Teams | Courts | Structure | Bracket | Total rds | Min games/team |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SP-06 | 6  | 3 | 1 | Double RR | Championship (Top 2) | 7 | 4 |
| SP-08 | 8  | 4 | 2 | Single RR | Top-4 SE (Semis + Final) | 5 | 4 |
| SP-10 | 10 | 5 | 2 | Single RR, 1 sits/rd | Top-4 SE | 7 | 4 |
| SP-12 | 12 | 6 | 3 | Single RR | Top-4 SE | 7 | 5 |
| SP-14 | 14 | 7 | 3 | Single RR, 1 sits/rd | Top-4 SE | 9 | 6 |
| SP-16 | 16 | 8 | 4 | 2 pools of 4 + cross-pool round | Top-4 SE | 6 | 4 |
| SP-18 | 18 | 9 | 4 | 2 pools (5 + 4) + cross-pool round | Top-4 SE | 7 | 4 |

## Glossary rules (Excel — authoritative)

- **Scoring** — games to 11, win by 2.
- **Tiebreaker order** — Wins → Head-to-Head → Point Diff → Points For.
- **Top-4 SE bracket** — 1 v 4 and 2 v 3. Winners meet in Final.
- **Top-8 SE bracket** — quarters 1v8, 4v5, 2v7, 3v6 then standard SE.
- **Snake draft (RP only)** — for RP playoffs, individuals are paired by snake
  to balance the teams: Top-4 → seeds 1+4 / 2+3; Top-8 → seeds 1+8 / 2+7 / 3+6 /
  4+5, then bracket as above.

## ⚠️ Three material inconsistencies — Sam to ratify

These contradictions exist between the three sources. They aren't cosmetic — they
change which teams play whom and how many games people play.

### 1. Playoff pairing rule — snake (Excel) vs top-down (popup.html)

|  | Excel glossary | popup.html + verify.js |
| --- | --- | --- |
| Top-4 pairing | **Snake**: seeds 1+4 vs 2+3 | **Top-down**: 1+2 vs 3+4 |
| Top-8 pairing | **Snake**: 1+8, 2+7, 3+6, 4+5 → bracket | **Top-down**: (1+2) vs (7+8); (3+4) vs (5+6) |
| popup.html justification | — | "matches the original Apr-29 Ladder Popup templates that have actually been run live" (comment at popup.html:923–935) |

The two approaches optimize for different goals: snake **balances** the
championship teams (strongest with weakest); top-down **rewards** the top seeds
by letting them play with each other. Whichever Sam picks needs to be locked in
writing before any TypeScript code lands, because `verify.js` currently encodes
the top-down rule as a hard assertion.

### 2. 8-player RR rotation — 6 rounds (Excel) vs 7 rounds (popup.html)

- **Excel RP-08:** 6 RR rounds, 6 games per player. Top-4 SE = 1 game.
- **popup.html `rr8`:** 7 RR rounds, 7 games per player (full partner rotation —
  every player partners every other player exactly once). Top-4 = 1 game.
- **`verify.js` [4]:** asserts every 8p plays exactly 7 RR games.
- **`8p_tournament_demo.html`:** also 7 rounds.

popup.html's 7-round rotation is *complete* — `(8 choose 2) / 4 = 7` and every
unique partner pair is realized exactly once. The Excel's 6-round version drops
one round for time. **17 min × 1 round = 17 min** decision: do we ship the
complete rotation or the time-trimmed one?

### 3. Standings tiebreakers — H2H included (Excel) vs missing (popup.html)

- Excel glossary: `Wins → Head-to-Head → Point Diff → Points For`.
- popup.html `rankStats`: `Wins → Point Diff → Points For`.
- Head-to-head is unimplemented. Edge cases with two-way ties on identical W/Diff
  exist; without H2H they fall through to PF, which can pick the wrong winner.

## What popup.html covers vs gaps

popup.html implements roughly 60% of the Excel playbook:

| Format family | popup.html | Excel | Gap |
| --- | --- | --- | --- |
| RP-04 | ✓ | ✓ | — |
| RP-05 | ✓ | ✓ | — |
| RP-06 | ✓ | ✓ | — |
| RP-07 | ✓ (generic) | ✓ | — |
| RP-08 | ✓ (7-round) | ✓ (6-round) | rotation length (see above) |
| RP-09 | ✓ (generic) | ✓ | — |
| **RP-10** | ✓ (Pool+Playoff path) | ✓ | popup treats 10p as 2 pools of 5; Excel treats as flat RR with 2 sits |
| **RP-11** | ✗ | ✓ | not in `validCounts` |
| **RP-12** | ✓ (Pool+Playoff) | ✓ | popup splits into 3 pools of 4; Excel runs a flat RR |
| **RP-13** | ✗ | ✓ | not in `validCounts` |
| **RP-14** | ✗ | ✓ | not in `validCounts` |
| **RP-15** | ✗ | ✓ | not in `validCounts` |
| RP-16 | ✓ (Pool+Playoff) | ✓ | pool vs flat (same as 12) |
| RP-17 | ✓ (Pool+Playoff) | ✓ | pool vs flat |
| RP-18 | ✓ (Pool+Playoff) | ✓ | pool vs flat |
| **SP-06..SP-18** | ✗ (no team scoring at all) | ✓ | entire format family missing |

popup.html's "Pool + Playoff" path is a different *structural* approach than
the Excel's flat RR with sit-outs. Either works; the Excel guarantees 6 RR
rounds regardless of player count, while popup.html's pools complete in 4–5
rounds. Choose one.

## Schema implications

Current Phase 1 schema (`supabase/migrations/`):

```sql
events.format          text default 'rr_se_8p'
matches.stage          text check (stage in ('rr_pool_a','rr_pool_b','semifinal','final'))
-- no teams table
-- no sit-outs / byes
-- no playoff_pairing record
```

Phase 2 needs:

1. `events.format` — full enum of 22 codes: `rp_04`..`rp_18`, `sp_06`,`sp_08`,
   `sp_10`,`sp_12`,`sp_14`,`sp_16`,`sp_18`.
2. `matches.stage` — needs `rr`, `quarterfinal`, `semifinal`, `final`, plus a
   nullable `pool` column. Drop the `rr_pool_a`/`rr_pool_b` literals; pools are
   data not types.
3. New table `teams(id, event_id, player1_id, player2_id, label)` — required for
   every SP-XX format. Match rows then reference `team_a_id` / `team_b_id` for
   SP, and continue to reference 4 player ids for RP.
4. A `round_byes(event_id, round, player_id)` table (or jsonb column on
   `rounds`) — for odd counts and counts not divisible by 4.
5. A `playoff_pairing(event_id, rule, frozen_at, overrides_json)` row — records
   which pairing rule was used (snake vs top-down) and any player-swapped
   overrides from Partner-Pick.

`migrations/0009_tournament_v2.sql` is the place to add these. Don't edit 0006.

## Porting plan (this folder → repo)

1. **Vendor + document** ← *this commit*. Artifacts under `./artifacts/`, this
   README capturing format catalogue + inconsistencies + plan.
2. **Pure-TS engines** under `src/lib/tournament/`:
   - `types.ts` — `Player`, `Team`, `Match`, `Round`, `EventConfig`, `Standing`.
   - `round-robin.ts` — RP-04..RP-09 generators (hand-coded + circle method).
   - `pool-playoff.ts` — pool splits + pool RR.
   - `standings.ts` — `tallyMatches`, `rankStats`, `computeRRStandings`,
     `computePoolStandings`.
   - `playoff.ts` — `computeOverallSeeding`, `playoffQualifierCount`,
     `defaultPlayoffPairing` (configurable: `'snake'` or `'top_down'`),
     `buildPlayoffSemis`, `buildPlayoffFinalIfReady`.
   - `formats.ts` — registry of 22 format codes.
3. **Vitest suite** under `src/lib/tournament/__tests__/` mirroring `verify.js`'s
   8 assertion blocks, with the pairing rule parameterized.
4. **Schema migration 0009** — wider format/stage enums, teams table, byes,
   playoff_pairing row.
5. **Same-Partner generators** — RP-08..RP-18 are mostly in popup.html already;
   SP-06..SP-18 are net-new and need team-scoring infra. Stub these as
   `throw new Error('TODO: SP-XX not implemented')` until Sam picks a sprint.
6. **UI work** is *after* engines + schema land — Live Event screen,
   Partner-Pick screen, Standings screen. Phase 1's RSVP/Confirmation UI is a
   pre-event flow, not a tournament-runtime UI.

## Open decisions Sam needs to make

1. **Pairing rule:** snake (Excel) or top-down (popup.html / what's been run)?
2. **8p rotation:** 6 rounds (Excel) or 7 rounds / complete partner rotation
   (popup.html)?
3. **Pool vs flat RR for 10–18 players:** popup.html's pool path or Excel's
   flat-RR-with-sit-outs path?
4. **Same-Partner formats:** in scope for Phase 2 launch, or follow-on?
5. **Head-to-head tiebreaker:** ship without (popup.html's current state) or
   add it (Excel rule)?
