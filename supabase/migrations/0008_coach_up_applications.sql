-- 0008_coach_up_applications.sql
-- Coach Up apprenticeship applications — submissions from the /coach-up/apply
-- form. Public INSERT-only; reads happen via the service-role client (same
-- read model as the discovery page).

create table public.coach_up_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  neighborhood text,
  dupr text,
  years_played text,
  where_play text,
  why text not null,
  hours_per_week text,
  weekend_availability text,
  commit_12wk text,
  honesty text,
  source text
);

alter table public.coach_up_applications enable row level security;

-- Anyone (incl. anon) can submit an application. No SELECT/UPDATE/DELETE
-- policy, so the anon/authenticated data API can't read applications back.
create policy coach_up_applications_insert_public on public.coach_up_applications
  for insert to anon, authenticated
  with check (true);
