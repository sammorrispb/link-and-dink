/**
 * Best-effort in-memory rate limiter for the admin login route.
 *
 * It's per-serverless-instance, so it doesn't persist across cold starts or
 * scale-out — but combined with a long random `ADMIN_PASSWORD` it's enough to
 * blunt a brute-force attempt on a single-operator login. A durable limiter
 * (e.g. Upstash) is a noted follow-up.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const attempts = new Map<string, number[]>();

/** Returns true if `key` is allowed another attempt right now. */
export function rateLimitOk(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length <= MAX_ATTEMPTS;
}
