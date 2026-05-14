import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieName, verifySessionToken } from "@/lib/admin/session";

// Reachable without a session — you need to get to login somehow.
const PUBLIC_PATHS = ["/admin/login", "/api/admin/login"];

/**
 * Coarse admin gate. Defense in depth: every admin mutation route ALSO calls
 * `requireAdmin` — a matcher misconfiguration here must not silently unprotect
 * anything.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getCookieName())?.value;
  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Coach Up member dashboard — gated behind the admin-cookie session for
    // v1 (real per-member auth ships with the product app).
    "/coach-up/dashboard",
  ],
};
