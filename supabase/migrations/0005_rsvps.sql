-- 0005_rsvps.sql
-- A player committing to an event. account_id = who paid (Phase 1: intent only).

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id),
  account_id uuid not null references public.accounts(id),
  payment_status text not null default 'intent'
    check (payment_status in ('intent', 'paid', 'refunded', 'failed')),
  payment_intent_id text,
  paid_at timestamptz,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'waitlist', 'canceled')),
  position integer,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, player_id)
);

create index rsvps_event_idx on public.rsvps(event_id);
create index rsvps_account_idx on public.rsvps(account_id);
