# Phase 1 — Complete

## What was built

**Scaffold**

- Next.js 16 (App Router, TypeScript strict, Turbopack), Tailwind v4, Biome, pnpm.
- Design system ported into the Tailwind theme (`src/app/globals.css` `@theme`):
  brand palette, semantic surface/text/border tokens, radii, Outfit font.
- `(public)` / `(app)` route groups, `src/proxy.ts` session refresh,
  `.env.example`, `vercel.json`.

**Database** (`supabase/migrations/0001`–`0007` + `seed.sql`)

- `accounts`, `players`, `player_account_links`, `events`, `rsvps`, `matches`.
- RLS: default deny + explicit grants; `current_account_id()` /
  `account_in_event()` SECURITY DEFINER helpers.
- `seed.sql` mirrors the mockup: 1 organizer + 8 players, 1 featured upcoming
  event with 4 confirmed RSVPs, 3 past completed events with final-match
  results, 3 more upcoming events.

**Discovery page** (`/pot/[slug]`) — the Phase 1 hero deliverable

- Server Component, reads live data via the service-role client.
- All mockup sections, in render order: Hero, Featured event card (Entry/Pot
  tiles + roster preview + CTA), How it works (4 steps), The pot ($80
  winner-take-all bar + callout), Who can play (DUPR + Coach-evaluated paths +
  inaugural callout), Trust grid (4 tiles), Organizer card, Past Pot Nights
  (real data, with an inaugural-cohort empty state), More upcoming (real data),
  Final CTA + tell-a-friend share.
- Mobile-first; per-event Open Graph + Twitter metadata; generated 1200×630 OG
  image via `next/og` at `/api/og/[slug]`.

**RSVP flow** (stubbed) — `/pot/[slug]/rsvp` → `/pot/[slug]/confirmed`

- Anonymous CTA → inline Supabase magic-link sign-in → `/auth/callback` →
  back to the RSVP page.
- Account is created/claimed on first sign-in (`ensureAccount`).
- If the account has no linked player, a create-player form (name + optional
  DUPR ID) runs; otherwise it RSVPs the existing player.
- `rsvpAction` records an `rsvps` row with `payment_status='intent'` — no charge
  (`STRIPE_LIVE=false`). `createCheckoutSession` is the stub seam for Phase 2.
- Confirmation page mirrors mockup Screen 2: "You're in" pill, live countdown,
  Match Night card, Entry/Pot tiles, roster, what-to-bring, Calendar/Share, and
  a working Cancel RSVP action.

**Quality gates**

- `pnpm build` passes (all 8 routes compile).
- `pnpm exec tsc --noEmit` clean.
- `pnpm lint` (Biome) clean — no errors, no warnings.

## What was skipped, and why

Everything on the prompt's out-of-scope list, plus:

- **No live render / browser test.** Docker isn't installed in the build
  environment, so `supabase start` couldn't run, and no cloud Supabase project
  was auto-provisioned (creating cloud resources is left to Sam — see below).
  Code correctness is verified (build + typecheck + lint); **feature
  correctness on a real page is not yet verified.**
- **Lighthouse (criterion #5) not measured** — needs a running app + DB.
- Live event UI, score entry/confirmation, draft mechanic, organizer console,
  SMS, Stripe live, DUPR API, coach eval flow, promotion/relegation, Link Score
  math, multi-bracket, onboarding, notifications — all Phase 2+, schema-only or
  absent as instructed.

## Decisions made that weren't in the prompt — please ratify

1. **Next.js 16, not 15.** `create-next-app@latest` installs 16. App Router and
   Server Components are identical; no reason to downgrade. Easy to pin to 15 if
   you'd rather.
2. **Tailwind theme lives in CSS, not `tailwind.config.ts`.** Tailwind v4's
   idiomatic config is `@theme` in `globals.css` — there is no
   `tailwind.config.ts`. Tokens are all there.
3. **`accounts.auth_user_id` column added.** The prompt's `accounts` schema had
   no bridge to Supabase auth, so RLS couldn't resolve `auth.uid()` → account.
   Added a nullable `auth_user_id` FK (nullable so seed/managed accounts can be
   unclaimed).
4. **Discovery page reads via the service-role client.** The page is public and
   anonymous, but RLS (correctly) blocks anon reads of `rsvps`. The public read
   path uses the service-role client server-side; RLS still governs the
   anon/authenticated API and every write. See `ARCHITECTURE.md`.
5. **`middleware.ts` → `proxy.ts`.** Next 16 deprecated the `middleware` file
   convention in favor of `proxy`.
6. **3 "more upcoming" events seeded, not 2.** The mockup's More Upcoming list
   shows 3 rows; matched that for visual fidelity.
7. **Past Pot Nights copy is data-derived.** The mockup's editorial flourishes
   ("wins back-to-back", "inaugural champ") aren't derivable from match data, so
   rows render as `{champion} takes the pot` + `{score} final · partnered with
   {partner} · {venue}`. Seed player "DJ" therefore reads "DJ takes the pot"
   (the mockup's "Devon J." — same person; the short name is what shows in the
   roster preview).
8. **Organizer card stats are static.** DUPR / events-run / host-rating aren't
   modeled in the DB yet (Phase 2).
9. **Inert mockup buttons** ("Book a free eval", "Connect DUPR", "Message Sam",
   "I'm here — Check in") link to `/pot` or the discovery page as placeholders —
   their real destinations are Phase 2 features.
10. **Hero `h1` is 32px** (the mockup's in-phone value), not the design-system
    `clamp(32px,6vw,72px)` — "reproduce Screen 1 pixel-fairly" took precedence.
11. **Built on the `PotNight` branch of the `link-and-dink` repo.** Old Hub
    files were removed on this branch only; `main` is untouched. This branch is
    the standalone Pot Night codebase — extract to its own repo if/when you want.

## Phase 2 starting punch-list

- [ ] **Provision infra** — create the Supabase project (do *not* reuse the
      Hub's), `supabase db push` + run `seed.sql`, set env vars, import to
      Vercel, confirm a preview URL builds.
- [ ] **Live render verification + Lighthouse** — confirm `/pot/[slug]` matches
      the mockup on a real device; hit ≥90 Performance + Accessibility.
- [ ] **Stripe live** — implement `createCheckoutSession`, the webhook to flip
      `payment_status` → `paid`, and refunds.
- [ ] **Live event UI** (mockup Screen 3) — round/court/timer, standings,
      bottom nav.
- [ ] **Score entry + confirmation** (Screens 4 / 4b) — winner enters, loser
      confirms via SMS deep link, 5-min auto-confirm, organizer dispute path.
- [ ] **Draft mechanic** — spec the snake/round-robin pick order, then build it.
- [ ] **Organizer console** — TD-side dashboard.
- [ ] **SMS** — Twilio for the 30-min reminder + score-confirm deep links.
- [ ] **Eval gate** — DUPR API sync, coach eval flow; enforce the
      reliability ≥70 / eval-within-a-year gate (4th week onward).
- [ ] **Link Score** — rating math + promotion/relegation.
- [ ] **Post-event recap** (Screen 5) — champion badge, Venmo confirmation,
      shareable card, Link Score delta.
- [ ] **Account claiming** — let a returning email claim its seeded account
      instead of creating a duplicate.
