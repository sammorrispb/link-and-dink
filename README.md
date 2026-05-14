# Link & Dink

[![Deploy status](https://vercelbadge.vercel.app/api/sammorrispb/link-and-dink)](https://link-and-dink.vercel.app)

**Play up.** — the marketing site for Link & Dink, a JOOLA-sponsored pickleball
platform for the DMV (DC, Maryland, Virginia).

Link & Dink matches intermediate players (3.0–4.0 DUPR) who've outgrown open
play to the right games and curated groups. This repo is the v1 marketing
site — a single homepage, no CMS, no auth.

**Live:** https://link-and-dink.vercel.app

## Stack

- [Next.js 16](https://nextjs.org) — App Router
- TypeScript (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com) — brand tokens via `@theme`
- Fonts: Outfit (primary) + Geist (fallback), loaded via `next/font`
- Deployed on [Vercel](https://vercel.com) — auto-deploys on push to `main`

## Local development

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

## Project structure

```
app/
  layout.tsx     # fonts, metadata, favicon
  page.tsx       # homepage — composes sections in order
  globals.css    # Tailwind base + @theme brand tokens + design system
components/
  Nav, Hero, SignupCard, Stats, Journeys/JourneyCard,
  TonightStrip, Why, NewsletterReprise, Footer
  brand/         # Logo + JourneyIcon (inline brand SVGs)
public/icons/    # active marketing icons (+ reserved/ for future product nav)
```

## Notes

- The newsletter form is visually complete but submits to a `console.log`
  placeholder — ESP integration is a follow-up. See [`TODO.md`](./TODO.md).
- Design source of truth: `linkanddink-homepage-v3.html` (the v2026-04-15
  mockup).
