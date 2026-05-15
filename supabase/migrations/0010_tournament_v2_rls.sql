-- 0010_tournament_v2_rls.sql
-- Phase 2 Live Event UI prep:
--   1. Add matches.locked_at + locked_by_account_id (organizer-lock signal,
--      kept distinct from confirmed_at which is reserved for the future
--      Screen-4 SMS loser-confirmation flow).
--   2. Tighten matches write policy to organizer-only.
--   3. Add SELECT/WRITE policies for the three tables introduced in 0009
--      (teams, round_byes, playoff_pairings) — they had RLS enabled with no
--      policies, making them inert from anon + authenticated.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. matches.locked_at
-- ─────────────────────────────────────────────────────────────────────────

alter table public.matches
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by_account_id uuid references public.accounts(id);

create index if not exists matches_event_locked_at_idx
  on public.matches(event_id, locked_at);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. SECURITY DEFINER helper: is the current account the event's organizer?
--    Mirrors account_in_event() from 0007 (same pattern, different predicate).
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.account_is_organizer(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events e
    where e.id = p_event_id
      and e.organizer_account_id = public.current_account_id()
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Tighten matches write: organizer only. The Phase 1 policy allowed any
--    participant in the event to write any match row — too loose for the
--    Live UI. Participant writes will come back via a narrower SECURITY
--    DEFINER RPC when the Screen-4 score-confirmation flow ships.
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists matches_write_organizer_or_participant on public.matches;

create policy matches_write_organizer on public.matches
  for all to authenticated
  using (public.account_is_organizer(event_id))
  with check (public.account_is_organizer(event_id));

-- matches_select_authenticated stays as-is (any authenticated user may read).

-- ─────────────────────────────────────────────────────────────────────────
-- 4. teams: authenticated read, organizer write.
-- ─────────────────────────────────────────────────────────────────────────

create policy teams_select_authenticated on public.teams
  for select to authenticated using (true);

create policy teams_write_organizer on public.teams
  for all to authenticated
  using (public.account_is_organizer(event_id))
  with check (public.account_is_organizer(event_id));

-- ─────────────────────────────────────────────────────────────────────────
-- 5. round_byes: authenticated read, organizer write.
-- ─────────────────────────────────────────────────────────────────────────

create policy round_byes_select_authenticated on public.round_byes
  for select to authenticated using (true);

create policy round_byes_write_organizer on public.round_byes
  for all to authenticated
  using (public.account_is_organizer(event_id))
  with check (public.account_is_organizer(event_id));

-- ─────────────────────────────────────────────────────────────────────────
-- 6. playoff_pairings: authenticated read, organizer write.
-- ─────────────────────────────────────────────────────────────────────────

create policy playoff_pairings_select_authenticated on public.playoff_pairings
  for select to authenticated using (true);

create policy playoff_pairings_write_organizer on public.playoff_pairings
  for all to authenticated
  using (public.account_is_organizer(event_id))
  with check (public.account_is_organizer(event_id));
