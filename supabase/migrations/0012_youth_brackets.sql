-- 0012_youth_brackets.sql
-- Youth tournament support: per-event age bracket, child identity on the
-- RSVP, parent contact stays on the player, guardian consent + waiver link.
--
-- Design choice: the player record represents the parent (preserves phone
-- dedup). Child first/last/birthdate ride alongside on the RSVP so the
-- roster + match UI can display the kid's name without a second player row.
-- All additive — adult-event flows are unchanged.

alter table public.events
  add column if not exists age_bracket text
    check (age_bracket in ('11U', '14U')),
  add column if not exists waiver_url text;

alter table public.rsvps
  add column if not exists child_first_name text,
  add column if not exists child_last_name text,
  add column if not exists child_birthdate date,
  add column if not exists guardian_consent boolean,
  add column if not exists guardian_consent_at timestamptz;
