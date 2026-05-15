import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function hmac(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

// ---------------------------------------------------------------------------
// pn_player cookie — anonymous RSVP identity.
// Encodes {playerId, eventId} so the confirmation page can show "your RSVP",
// the cancel action can run without auth, and /claim can verify ownership.
// Format: `<playerId>.<eventId>.<hmac>`
// ---------------------------------------------------------------------------

const RSVP_COOKIE_NAME = "pn_player";

function rsvpSecret(): string {
  const s = process.env.RSVP_COOKIE_SECRET;
  if (!s) throw new Error("Missing RSVP_COOKIE_SECRET — see .env.example");
  return s;
}

export interface RsvpCookiePayload {
  playerId: string;
  eventId: string;
}

export function signRsvpCookie(payload: RsvpCookiePayload): string {
  const body = `${payload.playerId}.${payload.eventId}`;
  return `${body}.${hmac(rsvpSecret(), body)}`;
}

export function verifyRsvpCookie(raw: string | undefined): RsvpCookiePayload | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [playerId, eventId, sig] = parts;
  const expected = hmac(rsvpSecret(), `${playerId}.${eventId}`);
  if (!safeEqual(sig, expected)) return null;
  return { playerId, eventId };
}

export const rsvpCookieName = RSVP_COOKIE_NAME;

// ---------------------------------------------------------------------------
// Per-event roster token — gates contact info on /api/events/[slug]/roster.json.
// Derived deterministically from the event id + a server-side pepper. The
// organizer page surfaces this so Sam can paste it into popup.html alongside
// the slug; rotating the pepper invalidates every previous token globally.
// ---------------------------------------------------------------------------

function rosterPepper(): string {
  const s = process.env.ROSTER_TOKEN_PEPPER;
  if (!s) throw new Error("Missing ROSTER_TOKEN_PEPPER — see .env.example");
  return s;
}

export function rosterTokenFor(eventId: string): string {
  return hmac(rosterPepper(), `roster:${eventId}`).slice(0, 16);
}

export function verifyRosterToken(eventId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = rosterTokenFor(eventId);
  if (token.length !== expected.length) return false;
  return safeEqual(token, expected);
}
