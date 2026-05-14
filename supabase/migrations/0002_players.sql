-- 0002_players.sql
-- Player = a playing identity: rating, bracket eligibility, match history.
-- Rating / eval fields stay null in Phase 1 until eval data flows in (Phase 2+).

create table public.players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,

  -- DUPR
  dupr_id text unique,
  dupr_rating numeric(4, 2),
  dupr_reliability integer check (dupr_reliability between 0 and 100),
  dupr_synced_at timestamptz,

  -- Link & Dink rating
  ld_rating numeric(5, 2),
  ld_bracket text,

  -- Eval status (Phase 2+ gate; schema-only in Phase 1, does not block RSVP)
  eval_status text check (
    eval_status in ('pending', 'dupr_verified', 'coach_evaluated', 'inaugural')
  ),
  eval_coach_account_id uuid references public.accounts(id) on delete set null,
  eval_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();
