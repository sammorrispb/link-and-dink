/**
 * Admin session token — a signed cookie value, no server-side session store.
 *
 * `payload.sig` where payload is base64url JSON `{ exp }` and sig is an
 * HMAC-SHA256 over the payload. Uses Web Crypto so the exact same code verifies
 * in the Edge runtime (middleware) and the Node runtime (route handlers).
 */

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * `__Host-` prefix in production (forces Secure + Path=/ + no Domain). Plain
 * name in dev so it works over http://localhost.
 */
export function getCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Host-ld_admin"
    : "ld_admin";
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET environment variable");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function b64urlEncode(data: string | ArrayBuffer): string {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Mint a fresh signed session token. */
export async function createSessionToken(): Promise<string> {
  const payload = b64urlEncode(
    JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  );
  const key = await getKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return `${payload}.${b64urlEncode(sig)}`;
}

/** Verify signature + expiry. `crypto.subtle.verify` is constant-time. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(sig),
      new TextEncoder().encode(payload),
    );
    if (!valid) return false;

    const data = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
