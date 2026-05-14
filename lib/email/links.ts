import crypto from "node:crypto";

/**
 * URL building + HMAC signing for email links.
 *
 * Two kinds of credential in play:
 *  - stored per-subscriber tokens (`unsubscribe_token`, `tracking_token`) —
 *    unguessable UUIDs that identify a subscriber for a single purpose;
 *  - HMAC signatures — protect the *other* params in a link (issue id, link
 *    id, purpose) so a URL can't be tampered with after we hand it out.
 */

const FALLBACK_SITE_URL = "https://www.linkanddink.com";

export function siteUrl(path: string): string {
  const base = process.env.SITE_URL ?? FALLBACK_SITE_URL;
  return new URL(path, base).toString();
}

function getSecret(): string {
  const secret = process.env.LINK_SIGNING_SECRET;
  if (!secret) {
    throw new Error("Missing LINK_SIGNING_SECRET environment variable");
  }
  return secret;
}

/** HMAC-SHA256 of `value`, hex-encoded. */
export function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Constant-time signature check. */
export function verify(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const provided = Buffer.from(signature);
  return (
    expected.length === provided.length &&
    crypto.timingSafeEqual(expected, provided)
  );
}

/** Signed double opt-in confirmation link. */
export function confirmUrl(subscriberId: string): string {
  const sig = sign(`confirm:${subscriberId}`);
  return siteUrl(`/api/confirm?sid=${subscriberId}&sig=${sig}`);
}

/**
 * Unsubscribe links — the token itself is the credential, no extra signing.
 *
 * - the *page* (visible footer link, GET): a human-facing confirmation page, so
 *   a link prefetcher can't silently unsubscribe someone;
 * - the *API* (List-Unsubscribe header, POST): RFC 8058 one-click, no UI.
 */
export function unsubscribePageUrl(token: string, issueId?: string): string {
  const q = issueId ? `?i=${issueId}` : "";
  return siteUrl(`/unsubscribe/${token}${q}`);
}

export function unsubscribeApiUrl(token: string, issueId?: string): string {
  const q = issueId ? `?token=${token}&i=${issueId}` : `?token=${token}`;
  return siteUrl(`/api/unsubscribe${q}`);
}

/**
 * Per-recipient tracking-token placeholder. Plain ASCII so it survives markdown
 * rendering and juice/cheerio re-serialization; the send drain replaces it with
 * each subscriber's `tracking_token`.
 */
export const TRACKING_TOKEN_PLACEHOLDER = "tracking-token-placeholder";

/**
 * Tracked click link. The destination is NOT a URL param — the click route
 * resolves `linkId` against the server-side `issue_links` table, so this can't
 * be abused as an open redirector. The signature protects issue + link id.
 */
export function trackClickUrl(issueId: string, linkId: string): string {
  const sig = sign(`click:${issueId}:${linkId}`);
  return siteUrl(
    `/api/track/click?i=${issueId}&l=${linkId}&s=${sig}&t=${TRACKING_TOKEN_PLACEHOLDER}`,
  );
}

/** Open-tracking 1x1 pixel URL. */
export function trackOpenUrl(issueId: string): string {
  const sig = sign(`open:${issueId}`);
  return siteUrl(
    `/api/track/open?i=${issueId}&s=${sig}&t=${TRACKING_TOKEN_PLACEHOLDER}`,
  );
}
