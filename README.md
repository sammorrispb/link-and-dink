# The Pickleball Pot Popup (P3)

**The Pickleball Pot Popup** — "P3" for short — is a player-funded competitive
pickleball bracket product for **Link & Dink**.
8-player doubles, Round Robin → Single Elimination, $10 entry, $80 winner-take-all
pot paid the same night.

This is a greenfield Next.js + Supabase codebase. The previous "Hub" build is
dead and nothing is carried over from it.

> **Phase 1** ships the public discovery page and a stubbed RSVP flow. Live
> event, score entry, drafting, payouts, organizer console, and SMS are Phase 2+.
> See [`PHASE_1_COMPLETE.md`](./PHASE_1_COMPLETE.md) for the exact boundary.

## Stack

| Concern        | Choice                                                    |
| -------------- | --------------------------------------------------------- |
| Framework      | Next.js 16, App Router, Server Components, TypeScript strict |
| Styling        | Tailwind CSS v4 (theme in `src/app/globals.css` via `@theme`) |
| DB / Auth      | Supabase (Postgres + magic-link auth + RLS)               |
| Payments       | Stripe Checkout — **stubbed in Phase 1** (`STRIPE_LIVE` flag) |
| Font           | Outfit via `next/font/google`                             |
| Lint / format  | Biome                                                     |
| Package manager| pnpm                                                      |
| Deploy         | Vercel                                                    |

> Next.js 16 (not 15) — `create-next-app@latest` installs 16, and App Router /
> Server Components are identical. Noted in `PHASE_1_COMPLETE.md` for ratification.

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Supabase

Local development needs Docker (for `supabase start`). Alternatively, link a
hosted Supabase project.

**Local stack:**

```bash
pnpm db:start          # supabase start  (requires Docker)
pnpm db:reset          # apply migrations 0001-0007 + run seed.sql
pnpm types             # regenerate src/lib/supabase/types.ts from the local DB
```

**Hosted project:**

```bash
supabase link --project-ref <your-ref>
supabase db push       # apply migrations
# then run supabase/seed.sql against the project once
pnpm types:linked      # regenerate types from the linked project
```

### 3. Environment

Copy `.env.example` to `.env.local` and fill in the values. For a local stack,
`supabase start` prints the URL + keys.

```bash
cp .env.example .env.local
```

| Var                              | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase API URL                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Anon key — RLS-enforced client                       |
| `SUPABASE_SERVICE_ROLE_KEY`      | Service-role key — server-only, public-page reads    |
| `NEXT_PUBLIC_SITE_URL`           | Used for magic-link redirects + OG image URLs        |
| `STRIPE_LIVE`                    | Feature flag — keep `false` for Phase 1              |
| `STRIPE_SECRET_KEY` / `_PUBLISHABLE_KEY` / `_WEBHOOK_SECRET` | Stripe (unused while stubbed) |

### 4. Run

```bash
pnpm dev               # http://localhost:3000  -> redirects to the current P3 popup
pnpm lint              # biome check
pnpm build             # production build
```

## Key routes

| Route                     | What it is                                              |
| ------------------------- | ------------------------------------------------------- |
| `/`                       | Redirects to the current P3 popup                       |
| `/pot/[slug]`             | **Discovery page** — the Phase 1 hero deliverable       |
| `/pot/[slug]/rsvp`        | RSVP flow (auth-gated; stubbed payment)                 |
| `/pot/[slug]/confirmed`   | Pre-event "You're in" confirmation                      |
| `/auth/callback`          | Supabase magic-link callback                            |
| `/api/og/[slug]`          | Generated 1200×630 Open Graph image                     |

## Deploy (Vercel)

1. Import the repo into Vercel; set the framework to Next.js.
2. Add every var from `.env.example` to the Vercel project (Production + Preview).
3. `vercel.json` enables deployments on the `PotNight` branch and disables them
   on `main`. Every push to `PotNight` gets a preview URL.

## Brand note

The Notion brand guide locks lime at `#CAF368` (authoritative for print/social).
In-product UI uses the softer `#b5d654` for readability — this is intentional and
documented in `src/app/globals.css`.

## Project layout

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the routing + data-flow map.
