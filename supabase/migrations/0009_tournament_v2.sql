-- 0009_tournament_v2.sql
-- Phase 2 tournament engine: widen format/stage enums, add teams, byes,
-- and playoff_pairing. Built to match src/lib/tournament/* and the format
-- catalogue in docs/tournament/README.md.
--
-- 0006_matches stays intact; this migration extends its enum and adds tables.

-- ─────────────────────────────────────────────────────────────────────────
-- events.format — expand to cover all 22 format codes (RP-04..18, SP-06..18).
-- The Phase 1 default of 'rr_se_8p' becomes a legacy alias; new rows use 'rp_08'.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.events
  alter column format set default 'rp_08';

update public.events
   set format = 'rp_08'
 where format = 'rr_se_8p';

alter table public.events
  add constraint events_format_check
  check (format in (
    'rp_04','rp_05','rp_06','rp_07','rp_08','rp_09','rp_10','rp_11','rp_12',
    'rp_13','rp_14','rp_15','rp_16','rp_17','rp_18',
    'sp_06','sp_08','sp_10','sp_12','sp_14','sp_16','sp_18'
  ));

-- ─────────────────────────────────────────────────────────────────────────
-- matches.stage — pools are data, not types. Add a separate `pool` column.
-- Drop the rr_pool_a/rr_pool_b literals; widen the enum to cover quarters
-- and championship (single-match top-4 final).
-- ─────────────────────────────────────────────────────────────────────────

alter table public.matches
  drop constraint matches_stage_check;

alter table public.matches
  add column if not exists pool text;

-- Backfill legacy pool literals into the new structure
update public.matches set pool = 'A', stage = 'rr' where stage = 'rr_pool_a';
update public.matches set pool = 'B', stage = 'rr' where stage = 'rr_pool_b';

alter table public.matches
  add constraint matches_stage_check
  check (stage in ('rr', 'quarterfinal', 'semifinal', 'final', 'championship'));

-- ─────────────────────────────────────────────────────────────────────────
-- Same-Partner support: teams (fixed doubles pairs) + team-vs-team matches.
-- ─────────────────────────────────────────────────────────────────────────

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  player1_id uuid not null references public.players(id),
  player2_id uuid not null references public.players(id),
  label text,
  seed integer,
  created_at timestamptz not null default now(),
  check (player1_id <> player2_id)
);

create index teams_event_idx on public.teams(event_id);
create unique index teams_event_pair_idx on public.teams (
  event_id,
  least(player1_id, player2_id),
  greatest(player1_id, player2_id)
);

alter table public.matches
  add column if not exists team_a_id uuid references public.teams(id),
  add column if not exists team_b_id uuid references public.teams(id);

-- Either the match references 4 individual players (RP) or 2 teams (SP),
-- but not both — and at least one side must be specified.
alter table public.matches
  add constraint matches_team_xor_check
  check (
    (team_a_id is not null and team_b_id is not null
       and team_a_player1_id is null and team_a_player2_id is null
       and team_b_player1_id is null and team_b_player2_id is null)
    or
    (team_a_id is null and team_b_id is null)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Round-level sit-outs / byes (RP-05, RP-06, RP-07, RP-09, RP-11, RP-13..15,
-- RP-17, RP-18, and SP-10, SP-14). One row per player who sits each round.
-- ─────────────────────────────────────────────────────────────────────────

create table public.round_byes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  round integer not null,
  player_id uuid not null references public.players(id),
  created_at timestamptz not null default now(),
  unique (event_id, round, player_id)
);

create index round_byes_event_idx on public.round_byes(event_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Playoff bracket draw — records which pairing rule was used and any player
-- swaps applied via Partner-Pick. One row per event once the bracket locks.
-- ─────────────────────────────────────────────────────────────────────────

create table public.playoff_pairings (
  event_id uuid primary key references public.events(id) on delete cascade,
  rule text not null check (rule in ('top_down', 'snake')),
  qualifier_count integer not null check (qualifier_count in (4, 8)),
  teams_json jsonb not null,
  locked_at timestamptz not null default now(),
  locked_by_account_id uuid references public.accounts(id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- RLS: enable on the new tables. Policies stay default-deny; service-role
-- bypasses for the public discovery path. Add policies separately when the
-- Live Event UI lands.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.teams enable row level security;
alter table public.round_byes enable row level security;
alter table public.playoff_pairings enable row level security;
