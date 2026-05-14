-- 0006_matches.sql
-- Every single match in an event. Schema only in Phase 1 — no live UI yet.
-- Drafting, score entry, and confirmation are Phase 2.

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  round integer not null,
  court integer not null,
  stage text not null
    check (stage in ('rr_pool_a', 'rr_pool_b', 'semifinal', 'final')),
  team_a_player1_id uuid references public.players(id),
  team_a_player2_id uuid references public.players(id),
  team_b_player1_id uuid references public.players(id),
  team_b_player2_id uuid references public.players(id),
  team_a_score integer,
  team_b_score integer,
  submitted_by_account_id uuid references public.accounts(id),
  submitted_at timestamptz,
  confirmed_at timestamptz,
  disputed_at timestamptz,
  resolved_by_account_id uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index matches_event_idx on public.matches(event_id);

create trigger matches_set_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();
