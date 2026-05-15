-- seed.sql — P3 (The Pickleball Pot Popup) Phase 1 mock data.
-- Runs automatically after `supabase db reset`. Also re-runnable standalone via
-- `pnpm db:seed` (truncates first, so it is idempotent).
--
-- Mirrors the names/numbers in pot-night-player-flow-v1.html so the discovery
-- page renders "4 of 8 spots left", the roster preview, and the Past P3 Popups
-- list straight from the database.

truncate table
  public.matches,
  public.rsvps,
  public.player_account_links,
  public.events,
  public.players,
  public.accounts
restart identity cascade;

-- ---------------------------------------------------------------------------
-- Accounts (logins). auth_user_id stays null — these are unclaimed until a real
-- magic-link login claims them (Phase 2 account-claiming).
-- ---------------------------------------------------------------------------
insert into public.accounts (id, email, display_name) values
  ('a0000000-0000-0000-0000-000000000001', 'sam@linkanddink.com',     'Sam Morris'),
  ('a0000000-0000-0000-0000-000000000002', 'sarah.k@example.com',     'Sarah K.'),
  ('a0000000-0000-0000-0000-000000000003', 'mike.r@example.com',      'Mike R.'),
  ('a0000000-0000-0000-0000-000000000004', 'lisa.t@example.com',      'Lisa T.'),
  ('a0000000-0000-0000-0000-000000000005', 'devon.j@example.com',     'Devon J.'),
  ('a0000000-0000-0000-0000-000000000006', 'maya.p@example.com',      'Maya P.'),
  ('a0000000-0000-0000-0000-000000000007', 'jordan.b@example.com',    'Jordan B.'),
  ('a0000000-0000-0000-0000-000000000008', 'carlos.r@example.com',    'Carlos R.'),
  ('a0000000-0000-0000-0000-000000000009', 'priya.n@example.com',     'Priya N.');

-- ---------------------------------------------------------------------------
-- Players (playing identities). DUPR values mirror the mockup where given.
-- ld_rating / eval fields stay null in Phase 1.
-- ---------------------------------------------------------------------------
insert into public.players (id, display_name, dupr_rating, dupr_reliability, eval_status) values
  ('b0000000-0000-0000-0000-000000000001', 'Sarah K.',  3.92, 84, 'dupr_verified'),
  ('b0000000-0000-0000-0000-000000000002', 'Mike R.',   3.78, 78, 'dupr_verified'),
  ('b0000000-0000-0000-0000-000000000003', 'Lisa T.',   3.70, 72, 'dupr_verified'),
  ('b0000000-0000-0000-0000-000000000004', 'DJ',        3.81, 70, 'dupr_verified'),
  ('b0000000-0000-0000-0000-000000000005', 'Maya P.',   3.88, 81, 'dupr_verified'),
  ('b0000000-0000-0000-0000-000000000006', 'Jordan B.', 3.74, 69, 'inaugural'),
  ('b0000000-0000-0000-0000-000000000007', 'Carlos R.', 3.79, 75, 'dupr_verified'),
  ('b0000000-0000-0000-0000-000000000008', 'Priya N.',  3.95, 88, 'dupr_verified');

-- Link each player account to its player identity.
insert into public.player_account_links (account_id, player_id, link_type, verified_at) values
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'primary', now()),
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'primary', now()),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'primary', now()),
  ('a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'primary', now()),
  ('a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 'primary', now()),
  ('a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000006', 'primary', now()),
  ('a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000007', 'primary', now()),
  ('a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000008', 'primary', now());

-- ---------------------------------------------------------------------------
-- Events. All at Next Gen Academy, Rockville. $10 entry x 8 = $80 pot.
-- ---------------------------------------------------------------------------
insert into public.events
  (id, slug, title, starts_at, ends_at, venue_name, venue_address, bracket,
   format, entry_fee_cents, pot_amount_cents, max_players, organizer_account_id, status)
values
  -- Featured upcoming event (the Phase 1 hero deliverable target).
  ('c0000000-0000-0000-0000-000000000001', 'pot-night-2026-05-26-ngpa',
   'Tuesday P3 Popup @ NGPA',
   '2026-05-26 19:30:00-04', '2026-05-26 21:00:00-04',
   'Next Gen Academy', 'Rockville, MD', '3.5-4.0',
   'rp_08', 1000, 8000, 8, 'a0000000-0000-0000-0000-000000000001', 'open'),

  -- Past completed events.
  ('c0000000-0000-0000-0000-000000000002', 'pot-night-2026-05-19-ngpa',
   'Tuesday P3 Popup @ NGPA',
   '2026-05-19 19:30:00-04', '2026-05-19 21:00:00-04',
   'Next Gen Academy', 'Rockville, MD', '3.5-4.0',
   'rp_08', 1000, 8000, 8, 'a0000000-0000-0000-0000-000000000001', 'completed'),
  ('c0000000-0000-0000-0000-000000000003', 'pot-night-2026-05-12-ngpa',
   'Tuesday P3 Popup @ NGPA',
   '2026-05-12 19:30:00-04', '2026-05-12 21:00:00-04',
   'Next Gen Academy', 'Rockville, MD', '3.5-4.0',
   'rp_08', 1000, 8000, 8, 'a0000000-0000-0000-0000-000000000001', 'completed'),
  ('c0000000-0000-0000-0000-000000000004', 'pot-night-2026-05-05-ngpa',
   'Tuesday P3 Popup @ NGPA',
   '2026-05-05 19:30:00-04', '2026-05-05 21:00:00-04',
   'Next Gen Academy', 'Rockville, MD', '3.5-4.0',
   'rp_08', 1000, 8000, 8, 'a0000000-0000-0000-0000-000000000001', 'completed'),

  -- More upcoming events.
  ('c0000000-0000-0000-0000-000000000005', 'pot-night-2026-06-02-ngpa',
   'Tuesday P3 Popup @ NGPA',
   '2026-06-02 19:30:00-04', '2026-06-02 21:00:00-04',
   'Next Gen Academy', 'Rockville, MD', '3.5-4.0',
   'rp_08', 1000, 8000, 8, 'a0000000-0000-0000-0000-000000000001', 'open'),
  ('c0000000-0000-0000-0000-000000000006', 'pot-night-2026-06-09-ngpa',
   'Tuesday P3 Popup @ NGPA',
   '2026-06-09 19:30:00-04', '2026-06-09 21:00:00-04',
   'Next Gen Academy', 'Rockville, MD', '4.0-4.5',
   'rp_08', 1000, 8000, 8, 'a0000000-0000-0000-0000-000000000001', 'open'),
  ('c0000000-0000-0000-0000-000000000007', 'pot-night-2026-06-16-ngpa',
   'Tuesday P3 Popup @ NGPA',
   '2026-06-16 19:30:00-04', '2026-06-16 21:00:00-04',
   'Next Gen Academy', 'Rockville, MD', '3.5-4.0',
   'rp_08', 1000, 8000, 8, 'a0000000-0000-0000-0000-000000000001', 'open');

-- ---------------------------------------------------------------------------
-- RSVPs for the featured event: 4 of 8 confirmed (Sarah, Mike, Lisa, DJ).
-- payment_status 'paid' represents the seeded cohort; live RSVPs in Phase 1
-- land as 'intent' (Stripe charge is stubbed).
-- ---------------------------------------------------------------------------
insert into public.rsvps
  (event_id, player_id, account_id, payment_status, paid_at, status, position)
values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000002', 'paid', now(), 'confirmed', 1),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000003', 'paid', now(), 'confirmed', 2),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000004', 'paid', now(), 'confirmed', 3),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000005', 'paid', now(), 'confirmed', 4);

-- ---------------------------------------------------------------------------
-- Matches: the final from each past event, so "Past P3 Popups" renders real
-- winners + scores. team_a = champion pair. (RR / semifinal rows are Phase 2.)
-- ---------------------------------------------------------------------------
insert into public.matches
  (event_id, round, court, stage,
   team_a_player1_id, team_a_player2_id, team_b_player1_id, team_b_player2_id,
   team_a_score, team_b_score, submitted_at, confirmed_at)
values
  -- May 19 final: DJ + Maya P. def. Jordan B. + Carlos R., 11-8
  ('c0000000-0000-0000-0000-000000000002', 4, 1, 'final',
   'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007',
   11, 8, '2026-05-19 20:50:00-04', '2026-05-19 20:52:00-04'),
  -- May 12 final: Priya N. + Jordan B. def. Sarah K. + Mike R., 11-9
  ('c0000000-0000-0000-0000-000000000003', 4, 1, 'final',
   'b0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000006',
   'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
   11, 9, '2026-05-12 20:48:00-04', '2026-05-12 20:50:00-04'),
  -- May 5 final: Priya N. + Carlos R. def. Lisa T. + Maya P., 11-6
  ('c0000000-0000-0000-0000-000000000004', 4, 1, 'final',
   'b0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000007',
   'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005',
   11, 6, '2026-05-05 20:45:00-04', '2026-05-05 20:47:00-04');
