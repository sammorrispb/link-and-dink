import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  createSessionToken,
  getCookieName,
  getCookieOptions,
} from "@/lib/admin/session";
import { rateLimitOk } from "@/lib/admin/rate-limit";

/** Constant-time compare via equal-length SHA-256 digests. */
function passwordMatches(provided: string, expected: string): boolean {
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  // Same-origin check — blunts login CSRF on top of the SameSite=Lax cookie.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;
  const password = typeof data.password === "string" ? data.password : "";

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin:login] ADMIN_PASSWORD not configured");
    return NextResponse.json(
      { error: "Login is not configured." },
      { status: 500 },
    );
  }

  if (!password || !passwordMatches(password, expected)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getCookieName(), token, getCookieOptions());
  return res;
}
