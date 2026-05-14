-- 0004_events.sql
-- A Pot Night: one bracket, one venue, one night.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text not null,
  venue_address text,
  bracket text not null,
  format text not null default 'rr_se_8p',
  entry_fee_cents integer not null default 1000 check (entry_fee_cents >= 0),
  pot_amount_cents integer not null check (pot_amount_cents >= 0),
  pot_split text not null default 'winner_take_all'
    check (pot_split in ('winner_take_all')),
  max_players integer not null default 8 check (max_players > 0),
  organizer_account_id uuid not null references public.accounts(id),
  status text not null default 'open'
    check (status in ('open', 'full', 'in_progress', 'completed', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_status_starts_at_idx on public.events(status, starts_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();
