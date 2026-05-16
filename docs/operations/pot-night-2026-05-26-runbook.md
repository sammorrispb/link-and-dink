# P3 Popup #1 — Day-of Runbook

**Event:** Tuesday P3 Popup @ NGPA
**Slug:** `pot-night-2026-05-26-ngpa`
**Date:** Tue 2026-05-26
**Format:** `rp_08` — 8 players, 2 courts, 6 RR rounds (12 matches), top-4 championship match
**Pot:** $80 winner-take-all ($10 × 8 players, Venmo-at-door)

Print this page. Bring it. The app is not the safety net — this is.

---

## Pre-event checklist (week of)

```bash
# All checks should pass — run from ~/Projects/link-and-dink
curl -s https://p3.linkanddink.com/api/events/pot-night-2026-05-26-ngpa/roster.json | jq '.confirmed | length'   # → 8
curl -sI https://p3.linkanddink.com/api/og/pot-night-2026-05-26-ngpa | head -1                                    # → 200
curl -s "https://p3.linkanddink.com/pot/pot-night-2026-05-26-ngpa" -o /dev/null -w "%{http_code}"                 # → 200
pnpm test                                                                                                          # → all green
```

- [ ] **8 confirmed RSVPs** in production (curl above). Waitlist counts don't help — confirmed only.
- [ ] **Organizer sign-in works** on Sam's phone. Open `p3.linkanddink.com/organize/sign-in` → magic link to `sam.morris2131@gmail.com` (per `ORGANIZER_EMAILS`) → land on `/organize/[slug]`.
- [ ] **OG image renders** in iMessage when the event URL is shared.
- [ ] **Roster CSV downloads** from `/api/events/pot-night-2026-05-26-ngpa/roster.csv`. Print it as the call-sheet.
- [ ] **RSVP-page copy aligns with Venmo-at-door.** The page says "Enter the pot — $10" but no Stripe charge fires (`STRIPE_LIVE=false`). Either update the copy to say "Bring $10 Venmo at the door" in a separate PR, or text every confirmed player a copy clarification before May 26.
- [ ] **Print 2 paper brackets:** one RR grid (8-player, 2 courts, 6 rounds), one championship match form. PDF in `docs/tournament/artifacts/`.
- [ ] **Cash + phone fully charged.** Venmo open. NGPA scoreboard tape ready.

## Day-of script

### T-30 → arrive at NGPA
- Open `p3.linkanddink.com/pot/pot-night-2026-05-26-ngpa/live` on Sam's phone.
- Confirm 8 players present. For no-shows, the app has no in-app cancel for organizer (player-only cookie cancel). If you need to drop someone, use Supabase dashboard: `update rsvps set status='canceled' where event_id=… and player_id=…`. Have a backup player ready to swap in.
- Collect $10 from each player via Venmo to `@sam-morris-2131`. Tick them off the printed roster.

### T-0 → start
- Tap **Start Tournament**. The engine generates 12 RR matches across 6 rounds on courts 1 & 2.
- Announce: "First round, court 1: A+B vs C+D. Court 2: E+F vs G+H. Game to 11, win by 2."

### Per RR round (×6)
- Players play, you watch. Game to 11, win by 2.
- When a match ends, tap the match card, enter both scores, tap **Lock**.
- App rejects: tied scores, missing scores. If it rejects unexpectedly, write the score on paper and move on — recover after the event.
- After both courts finish the round, next round's pairings appear automatically.

### After RR (12 matches locked)
- Open the **Partner Pick** panel.
- Use `top_down` pairing (default): top-2 RR finishers partner up, #3 + #4 partner against them.
  - Alternative: `snake` pairs #1+#4 vs #2+#3 — feels more competitive. Sam's call.
- Tap **Save**. One championship match is created (NOT semis + final — 8-player playoff is a single match).

### Championship match
- Same flow: play, enter scores, tap **Lock**.
- Winning team gets $80 split ($40 each via Venmo).

### Payout
- Sam Venmos $40 to each winner. Memo: "P3 Popup 2026-05-26 winner — @LinkAndDink".
- Screenshot both Venmo confirmations. Save to phone — there is no in-app payout-proof affordance yet.
- Take a 30-second video: winner pair holding paddles, one-sentence "what'd you take away from tonight." Post to NGPA IG + the MD Pickleball FB group.

### Post-event (next day)
- `events.status` stays `in_progress` forever — there's no auto-transition. That's OK; flip it manually via Supabase dashboard if it bugs you: `update events set status='completed' where slug='pot-night-2026-05-26-ngpa'`.
- Player records persist for the data flywheel — that's the actual product anyway.

## Failure-mode quick reference

| Symptom | Action |
|---|---|
| `lockMatchAction` throws "Scores can't be tied" | Re-ask the players, fix one score by ±1 |
| `lockMatchAction` throws "Both scores required" | Type a 0 if a match was forfeited |
| `startTournamentAction` throws "needs 8 confirmed players" | Check Supabase: `select status, count(*) from rsvps where event_id=… group by status;` |
| `savePlayoffPairingAction` throws "Lock every round-robin match" | Find the unlocked match in the live UI (no lock indicator), close it out |
| Live page won't load | Go to paper bracket. After the event: enter scores manually via Supabase dashboard, lock matches via `update matches set locked_at=now(), locked_by_account_id='<sam-account-id>' where event_id=…` |
| Need to undo a locked match | Tap **Unlock** on the match card — that's the only path |
| Engine generated wrong number of matches | Should be 12 RR matches. If different, the seed roster has != 8 players. Fix the RSVP statuses then re-run **Start Tournament** (it's idempotent, but only if `matches.length = 0` — see actions.ts:55) |
| Player wants to cancel mid-event | Use Supabase dashboard. The app has no organizer-side cancel UI yet |

## Smoke-walkthrough findings (2026-05-16, 10 days pre-event)

Local smoke against `pnpm db:start` + seed + `pnpm dev`, multi-tab Chrome MCP. Findings that matter for May 26:

1. **Discovery page renders correctly.** Hero + entry/pot tiles + roster avatars + "How it works" + final CTA all match the iCloud mockup. Mobile (414×896) layout clean. Lighthouse-style perf wasn't measured but the page is server-rendered with no client-side data fetching, so it'll be fine.

2. **Static UUID seed + persistent `pn_player` cookies = local-dev gotcha.** `supabase/seed.sql` assigns the May 26 event a fixed UUID (`c0000000-…-001`). The anonymous RSVP cookie payload is `{playerId, eventId}` signed with `RSVP_COOKIE_SECRET`. After `pnpm db:seed` resets data, any browser that still has a cookie from a prior local-dev RSVP will be redirected from `/pot/[slug]/rsvp` straight to `/confirmed`, never seeing the form. **Doesn't affect production** (each prod event has its own UUID + the May 26 event is a one-time setup). Affects only local dev. If smoke-testing the RSVP UI locally, use incognito or clear `localhost:3001` cookies first.

3. **Port-collision footgun.** `pnpm dev` silently switches to `3001` when port `3000` is held by a stale process. Sam had a zombie `next-server` (PID 49100) from a previous session holding `:3000` — Chrome was talking to that, getting old routes back, hence "Not found" for `/organize` and `/pot/[slug]/live`. **Before going live May 26:** `lsof -i :3000` to confirm no zombies; if Sam runs the live admin on his laptop at NGPA, lock down which port the production deployment uses (the `pot-night` Vercel project doesn't care, but a local cached PWA might).

4. **Magic-link admin flow is PKCE-only.** The `/auth/callback` route expects a `code` query param and calls `exchangeCodeForSession(code)`. The Supabase admin `generate_link` API returns a **hash-token** URL (`#access_token=…&refresh_token=…`) — *not* the PKCE flow — and `@supabase/ssr` doesn't auto-detect hash tokens. Means: **the only way to sign in as the organizer is through `SignInForm` at `/organize/sign-in`**, which initiates the proper PKCE flow client-side and emails the right code-flow URL. There's no admin shortcut. For May 26: Sam clicks the link from the email that lands at `sam.morris2131@gmail.com` (or Mailpit locally) — that's the one path that works.

5. **Live admin route auth chain confirmed via curl on 3001:** `/pot/[slug]/live` returns `307 → /pot/[slug]/rsvp` when not signed in, which is the correct guard. The page-level `notFound()` is hit only when `hydrateTournamentEvent` returns null — that's a real event-doesn't-exist case, not an auth case. Good.

6. **Engine chain is green.** `pnpm test` shows 120 passing tests including the new `rp08-full-chain.test.ts` — generate → fill 12 RR matches → top-4 seeding → championship match → winner. Not a substitute for a live human walkthrough, but it's the strongest guardrail against engine regressions silently breaking the bracket on game night.

### Action items added from smoke

- [ ] **Sam: walk the actual organizer flow yourself** — sign in via SignInForm at `/organize/sign-in`, watch the email arrive (production: real Gmail; local: Mailpit at `http://127.0.0.1:54324`), click the link, land on `/organize`, navigate to the May 26 event, click into `/pot/.../live`. Time to first match-card render. This is the path you'll use on game night.
- [ ] **Decide where you'll run the live admin from on May 26** — your phone (Safari), your laptop, or NGPA's iPad. Whichever it is, test the magic-link flow on THAT device a few days before, since iOS Safari behaves differently than desktop Chrome (cookie scoping, deep linking, etc.).
- [ ] **Document the port-3000 zombie hazard** if you'll run `pnpm dev` for any pre-event tweaks. Add `lsof -i :3000 && pkill -f next-server` to your pre-dev shell helper.

## What's NOT in the app (don't expect these to work)

- **Stripe charge** — `STRIPE_LIVE=false`. RSVP records `payment_status='intent'`, no money moves. Collect $10 at the door.
- **SMS reminders** — no Twilio. Send manual reminders via iMessage or Notion.
- **Realtime updates to player phones** — `LiveClient.tsx` has no Supabase Realtime subscription. Only Sam's organizer browser sees live updates. Players see static cached pages.
- **Mark-as-Paid / payout proof upload** — Venmo manually, screenshot to your phone roll.
- **Recap / winner page** — `events.status` doesn't auto-flip to `completed`; there's no `/pot/[slug]/recap` route yet.
- **NL score parser** — score entry is per-match numeric inputs, not the natural-language bar from popup.html.

These gaps are the post-event-#1 backlog. After May 26 we know which of them actually hurt the live event vs which are theoretical.

## After the event

- Save Venmo screenshots into a folder: `~/Documents/NGA/P3-payouts/2026-05-26/`.
- Note any in-app surprises in this file (append a "## Post-event notes" section) — feeds the Phase 3 backlog.
- Update Open Brain: `record_outcome` with the event, winners, attendance, and what broke.
- Manually flip `events.status` to `completed` in Supabase if you want the discovery page to stop listing it as upcoming.
