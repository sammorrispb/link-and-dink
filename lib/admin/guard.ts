import { NextResponse } from "next/server";
import { getCookieName, verifySessionToken } from "./session";

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/**
 * Per-handler admin check — defense in depth behind `middleware.ts`. Middleware
 * is a coarse gate that a matcher misconfiguration could silently bypass, so
 * every admin mutation route calls this too.
 *
 * Returns a `NextResponse` (the error to return) when unauthorized, or `null`
 * when the request is good. Also enforces a same-origin check on the request,
 * which blocks cross-site POSTs on top of the cookie's `SameSite=Lax`.
 */
export async function requireAdmin(
  request: Request,
): Promise<NextResponse | null> {
  const token = readCookie(request.headers.get("cookie"), getCookieName());
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  if (!origin || origin !== expected) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  return null;
}
