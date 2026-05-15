import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRosterForExport } from "@/lib/events";
import { verifyRosterToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "X-Roster-Token, Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Public roster for the popup.html bracket tool. Names + RSVP status are
 * public (already visible on the discovery page). Phone, Venmo, and email
 * are gated behind a per-event token (X-Roster-Token header OR ?token=).
 */
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const includeContact = url.searchParams.get("include") === "contact";
  const includeCanceled = url.searchParams.get("includeCanceled") === "1";

  const data = await getRosterForExport(slug, { includeCanceled });
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS_HEADERS });
  }
  const { event, rows } = data;

  let revealContact = false;
  if (includeContact) {
    const token = request.headers.get("X-Roster-Token") ?? url.searchParams.get("token");
    revealContact = verifyRosterToken(event.id, token);
    if (!revealContact) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401, headers: CORS_HEADERS });
    }
  }

  const body = {
    event: {
      id: event.id,
      slug: event.slug,
      name: event.title,
      starts_at: event.startsAt,
      venue_name: event.venueName,
      pot_amount_cents: event.potAmountCents,
      pot_funder: event.potFunder,
      game_length: event.gameLength,
      max_players: event.maxPlayers,
      format: event.format,
    },
    players: rows.map((r) => ({
      name: r.displayName,
      first_name: r.firstName,
      last_name: r.lastName,
      rsvp_status: r.rsvpStatus,
      position: r.position,
      ...(revealContact
        ? {
            phone: r.phone,
            venmo: r.venmoHandle,
            email: r.email,
          }
        : {}),
    })),
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      // Never cache: the response body varies by the X-Roster-Token header,
      // and Vercel's CDN doesn't key on request headers by default — caching
      // would let a contact-info response leak to a subsequent no-token call.
      // The endpoint is one DB round-trip; serving fresh every time is cheap.
      "Cache-Control": "no-store",
    },
  });
}
