import { NextResponse } from "next/server";
import { drain } from "@/lib/newsletter/drain";

// Bounded per-run; Vercel Pro allows up to 300s but the batch is sized to
// finish well under this.
export const maxDuration = 60;

/**
 * Cron entry for the send queue. Vercel cron presents
 * `Authorization: Bearer ${CRON_SECRET}`; an unprotected drain route would be a
 * public "send my newsletter" button.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await drain();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron:drain]", err);
    return NextResponse.json({ error: "Drain failed" }, { status: 500 });
  }
}
