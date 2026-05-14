# Phase 1 — Complete

> The product is **The Pickleball Pot Popup** ("P3" for short). It was named
> "Pot Night" during the initial build; user-facing copy and docs were renamed
> post–Phase 1. Internal identifiers (the `pot-night` Vercel project, the
> `PotNight` git branch, the `/pot/` route, event slugs) intentionally still use
> the original codename.

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
  inaugural callout), Trust grid (4 tiles), Organizer card, Past P3 Popups
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

**Provisioned + verified live**

- Supabase: all 7 migrations + seed applied to the `link-and-dink` project
  (ref `tqqhbccomjhfnylafwnk`), alongside the existing newsletter tables.
- Discovery page + RSVP sign-in verified rendering against the live DB, both on
  local dev and the Vercel deployment.
- Vercel: `pot-night` project linked, env vars set (Production + Preview), GitHub
  repo connected for auto-deploy on push, first deployment live and public.
- Lighthouse (mobile) on the deployed discovery page: **Performance 99,
  Accessibility 100** — clears the ≥90 bar.

## What was skipped, and why

Everything on the prompt's out-of-scope list, plus:

- **Magic-link RSVP round-trip not exercised end-to-end.** The sign-in form
  renders and the redirect URLs are configured; sending + clicking an actual
  magic-link email wasn't walked through.
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
7. **Past P3 Popups copy is data-derived.** The mockup's editorial flourishes
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
    the standalone P3 codebase — extract to its own repo if/when you want.

## Infra (done)

- [x] **Supabase** — migrations + seed applied to the `link-and-dink` project.
- [x] **Vercel** — `pot-night` project linked, env vars set, GitHub repo
      connected for auto-deploy, first deployment live + public.
- [x] **Live render + Lighthouse** — verified; Performance 99, Accessibility 100.

## Phase 2 starting punch-list

- [ ] **Magic-link RSVP** — walk an actual sign-in email through end-to-end now
      that the redirect URLs are configured.
- [ ] **Custom domain + `NEXT_PUBLIC_SITE_URL`** — point linkanddink.com (or a
      subdomain) at the Vercel project and set `NEXT_PUBLIC_SITE_URL` so OG
      images + magic-link redirects use the real host.
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
