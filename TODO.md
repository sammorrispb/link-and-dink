# TODO — Link & Dink marketing site

Out-of-scope items from the v1 build session, ordered by priority for the next
session.

## High — blocks a real launch

1. **Newsletter — sending.** Signup *capture* is done: the form writes to the
   Supabase `subscribers` table (project `link-and-dink`,
   `tqqhbccomjhfnylafwnk`) via `/api/subscribe`, with success/error states and a
   honeypot. Still needed: a way to *send* "Link & Dink Weekly" — Beehiiv free
   (2,500 subs) is the frontrunner; import the Supabase list when ready.
   Follow-ups for the capture flow: real rate limiting on `/api/subscribe`
   (honeypot only for now), and a double opt-in / confirmation email.
2. **Journey landing pages.** The three journey cards (`/play`, `/improve`,
   `/intro`) link to `#`. Build the real pages, or point them at interim
   content.
3. **Custom domain.** Connect `linkanddink.com` (or chosen domain) in Vercel and
   update `metadataBase` + `SITE_URL` in `app/layout.tsx`.

## Medium — fills out the funnel

4. **"Tonight's games" page.** The hero `TonightStrip` CTA links to `#`. Decide
   whether this is a real feature or stays a waitlist/coming-soon page for v1.
5. **Footer links.** Most footer links point to `#`. Wire up the ones that have
   real destinations (Instagram, Facebook, etc.).
6. **Analytics.** Add Vercel Analytics or similar to measure newsletter
   conversion and journey-card clicks.

## Low — polish

7. **Real OG/social image.** Currently no `og:image`. Add a branded share card.
8. **Performance pass.** Beyond `next/font`, audit Lighthouse once there's real
   content and images.
9. **Member auth / product app.** Reserved icons (`Directory`, `Chat`) live in
   `public/icons/reserved/` for the future product nav — not part of the
   marketing site.

## Notes from the build

- The original v3.html stats strip had a "17 Dill Dinkers courts" stat. Per
  Sam's no-DD-references rule it was replaced with "MoCo — Launching first, DMV
  next". Revisit the copy if the rollout story changes.
- Scaffolded on **Next.js 16** (create-next-app latest), not 15 — App Router,
  strictly newer, Vercel-native.
