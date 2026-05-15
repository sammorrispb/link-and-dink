-- 0009_pot_night_v1_alignment.sql
-- Align the schema with the Pot Night v1 product spec (2026-05-14):
--   - players carry first/last/phone/venmo/email directly (phone is the dedup key)
--   - events carry pot_funder + game_length
--   - rsvps can exist anonymously (no account_id) and get claimed later
--
-- All additive — Phase 1 seed continues to work; existing rows are untouched.

-- players: spec-aligned identity fields. All nullable so the discovery seed,
-- DUPR-only players, and anonymous RSVPs all coexist.
alter table public.players
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists venmo_handle text,
  add column if not exists email text;

-- Phone is the dedup key for anonymous RSVPs. UNIQUE partial index allows
-- legacy rows with NULL phone.
create unique index if not exists players_phone_key
  on public.players(phone) where phone is not null;

-- events: pot funder + game length per spec.
alter table public.events
  add column if not exists pot_funder text,
  add column if not exists game_length integer default 11
    check (game_length in (11, 15));

-- rsvps: anonymous RSVPs need account_id to be nullable. Players claim the
-- account later via /claim and we backfill the rsvp row.
alter table public.rsvps
  alter column account_id drop not null;

-- Tighten the rsvps_insert_own policy: previously required
-- account_id = current_account_id(). Anonymous RSVPs come through the
-- service-role client (bypasses RLS), so the policy only governs the
-- authenticated path now — and an authenticated user can RSVP either with
-- their own account_id or, on first sign-in mid-flow, no account_id at all.
drop policy if exists rsvps_insert_own on public.rsvps;
create policy rsvps_insert_own on public.rsvps
  for insert to authenticated
  with check (account_id is null or account_id = public.current_account_id());

-- And: a player who's claimed their account can update their own rsvp.
-- Allow update by account match OR by service-role (the cancel server action
-- runs through service-role with a cookie-validated player_id).
drop policy if exists rsvps_update_own on public.rsvps;
create policy rsvps_update_own on public.rsvps
  for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());
