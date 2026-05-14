-- 0007_rls.sql
-- Row Level Security: default deny, then explicit grants.
--
-- Note on the public discovery page: it renders server-side via the service-role
-- client (see src/lib/supabase/service.ts), which bypasses RLS by design. These
-- policies govern the anon/authenticated data API — the security-sensitive paths
-- (RSVP creation, player updates) all route through the RLS-enforced client.

alter table public.accounts enable row level security;
alter table public.players enable row level security;
alter table public.player_account_links enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.matches enable row level security;

-- SECURITY DEFINER helper: is the current account RSVP'd to this event?
-- Used by the rsvps SELECT policy to avoid recursive RLS evaluation.
create or replace function public.account_in_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rsvps
    where event_id = p_event_id
      and account_id = public.current_account_id()
  );
$$;

-- accounts: holders read / update / claim their own row.
create policy accounts_select_own on public.accounts
  for select to authenticated using (auth_user_id = auth.uid());
create policy accounts_insert_own on public.accounts
  for insert to authenticated with check (auth_user_id = auth.uid());
create policy accounts_update_own on public.accounts
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- players: any authenticated user can read; only linked accounts can update.
-- Insert is open to authenticated users (a new player has no links yet — the
-- caller creates the link immediately after, see the RSVP flow).
create policy players_select_authenticated on public.players
  for select to authenticated using (true);
create policy players_insert_authenticated on public.players
  for insert to authenticated with check (true);
create policy players_update_linked on public.players
  for update to authenticated
  using (
    exists (
      select 1 from public.player_account_links l
      where l.player_id = players.id
        and l.account_id = public.current_account_id()
    )
  );

-- player_account_links: holders read their own links and can create links for
-- themselves.
create policy pal_select_own on public.player_account_links
  for select to authenticated using (account_id = public.current_account_id());
create policy pal_insert_own on public.player_account_links
  for insert to authenticated with check (account_id = public.current_account_id());

-- events: anyone (incl. anon) can read non-canceled events; only the organizer
-- can insert / update their own events.
create policy events_select_public on public.events
  for select using (status in ('open', 'full', 'in_progress', 'completed'));
create policy events_insert_organizer on public.events
  for insert to authenticated
  with check (organizer_account_id = public.current_account_id());
create policy events_update_organizer on public.events
  for update to authenticated
  using (organizer_account_id = public.current_account_id())
  with check (organizer_account_id = public.current_account_id());

-- rsvps: a participant can read the full roster for any event they're in; the
-- organizer can read all RSVPs for their events; holders create / update their
-- own RSVP.
create policy rsvps_select_participant on public.rsvps
  for select to authenticated using (public.account_in_event(event_id));
create policy rsvps_select_organizer on public.rsvps
  for select to authenticated using (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id
        and e.organizer_account_id = public.current_account_id()
    )
  );
create policy rsvps_insert_own on public.rsvps
  for insert to authenticated
  with check (account_id = public.current_account_id());
create policy rsvps_update_own on public.rsvps
  for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

-- matches: any authenticated user can read matches for an event; only the
-- organizer or a participating account can submit / confirm (Phase 2 UI).
create policy matches_select_authenticated on public.matches
  for select to authenticated using (true);
create policy matches_write_organizer_or_participant on public.matches
  for all to authenticated
  using (
    public.account_in_event(event_id)
    or exists (
      select 1 from public.events e
      where e.id = matches.event_id
        and e.organizer_account_id = public.current_account_id()
    )
  )
  with check (
    public.account_in_event(event_id)
    or exists (
      select 1 from public.events e
      where e.id = matches.event_id
        and e.organizer_account_id = public.current_account_id()
    )
  );
