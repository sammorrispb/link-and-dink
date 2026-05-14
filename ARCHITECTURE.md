# Architecture

One-page map of how P3 (The Pickleball Pot Popup) is wired, for whoever picks up
Phase 2.

## Routing

Two App Router route groups:

- **`(public)`** — unauthenticated. `/` and `/pot` redirect to the current
  event; `/pot/[slug]` is the discovery page.
- **`(app)`** — authenticated. `/pot/[slug]/rsvp` and `/pot/[slug]/confirmed`.

Route groups are URL-invisible: `(app)/pot/[slug]/rsvp/page.tsx` serves
`/pot/<slug>/rsvp`, not `/app/...`.

`src/proxy.ts` (Next 16's renamed `middleware`) refreshes the Supabase auth
session cookie on every request.

## Data flow

```
                    ┌─────────────────────────────────────────┐
                    │  Supabase Postgres (RLS: default deny)   │
                    └─────────────────────────────────────────┘
                       ▲                          ▲
        service-role   │                          │  anon + user session
        (bypasses RLS) │                          │  (RLS enforced)
                       │                          │
        ┌──────────────┴───────────┐   ┌──────────┴──────────────────┐
        │ src/lib/supabase/        │   │ src/lib/supabase/           │
        │   service.ts             │   │   server.ts  (SC / actions) │
        │ (public page reads only) │   │   client.ts  (browser)      │
        └──────────────┬───────────┘   └──────────┬──────────────────┘
                       │                          │
        ┌──────────────┴───────────┐   ┌──────────┴──────────────────┐
        │ src/lib/events.ts        │   │ RSVP server actions +       │
        │ getEventWithRoster()     │   │ src/lib/account.ts          │
        │ getPastResults()         │   │ ensureAccount()             │
        │ getUpcomingEvents()      │   │ getLinkedPlayers()          │
        └──────────────┬───────────┘   └──────────┬──────────────────┘
                       │                          │
              discovery page              rsvp / confirmed pages
```

### Two Supabase clients, on purpose

- **`service.ts`** — service-role key, **bypasses RLS**. Used only by the public
  discovery page (a Server Component) so anonymous visitors can see the event,
  roster, and past results. It is `server-only` and never returns raw rows to
  the client without field-picking.
- **`server.ts` / `client.ts`** — anon key, **RLS enforced**. Every
  security-sensitive path (RSVP creation, player creation, account claiming)
  goes through these, so RLS is the real boundary.

RLS itself lives in `supabase/migrations/0007_rls.sql`: default deny, then
explicit grants. `current_account_id()` and `account_in_event()` are
`SECURITY DEFINER` helpers that map `auth.uid()` → account and avoid recursive
policy evaluation.

## Identity model

```
auth.users ──(auth_user_id)──> accounts ──< player_account_links >── players
                                  │                                    │
                                  └────────────< rsvps >───────────────┘
                                                  │
                                               events ──< matches
```

- **account** = a login. `auth_user_id` bridges to Supabase auth (nullable so
  seed/managed accounts can exist unclaimed).
- **player** = a playing identity (rating, bracket, history). Rating/eval fields
  stay null until Phase 2 eval data flows in.
- **player_account_links** = many-to-many (a parent manages kids; a player can
  be transferred between accounts).
- **rsvps** = a player committing to an event; `account_id` = who paid.
- **matches** = every match in an event — **schema only in Phase 1**, no UI.

## Naming convention

snake_case in Postgres, camelCase in TypeScript. Mapping happens at one
boundary: the mappers in `src/lib/events.ts` turn `EventRow` → `PotEvent`.
Domain types live in `src/lib/domain.ts`.

## Components

- `src/components/ui/*` — atomic primitives (Button, Pill, Card, Avatar,
  SectionHeader, Callout, DateTag, EntryPotTiles, Logo).
- `src/components/pot/*` — discovery + confirmation sections (HeroSection,
  FeaturedEvent, HowItWorks, PotBar, WhoCanPlay, TrustGrid, OrganizerCard,
  PastEvents, MoreUpcoming, FinalCta, TopBar, MobileShell, SignInForm,
  Countdown, ShareLink).

Server Components by default; only `SignInForm`, `Countdown`, and `ShareLink`
are `"use client"` (they need interactivity).

## Payments

`src/lib/stripe.ts` — `STRIPE_LIVE` defaults to `false`. `createCheckoutSession`
returns `{ mode: "stubbed" }` and the RSVP action records
`payment_status='intent'` with no charge. Phase 2 flips the flag and implements
the real Checkout Session inside that function; the RSVP action already branches
on `mode === "redirect"`.
