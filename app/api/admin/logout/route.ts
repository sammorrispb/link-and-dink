import { NextResponse } from "next/server";
import { getCookieName } from "@/lib/admin/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Expire the session cookie.
  res.cookies.set(getCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
