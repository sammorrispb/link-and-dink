import "server-only";
import type {
  EventStatus,
  EventWithRoster,
  PastResult,
  PotEvent,
  RosterEntry,
  UpcomingEventSummary,
} from "./domain";
import { createServiceClient } from "./supabase/service";
import type { EventRow, MatchRow, PlayerRow, RsvpRow } from "./supabase/types";

// ---------------------------------------------------------------------------
// Mappers: snake_case DB rows -> camelCase domain objects.
// ---------------------------------------------------------------------------
function mapEvent(row: EventRow): PotEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    bracket: row.bracket,
    format: row.format,
    entryFeeCents: row.entry_fee_cents,
    potAmountCents: row.pot_amount_cents,
    potSplit: row.pot_split,
    maxPlayers: row.max_players,
    organizerAccountId: row.organizer_account_id,
    status: row.status as EventStatus,
  };
}

// ---------------------------------------------------------------------------
// Public reads. These run via the service-role client (bypasses RLS) because
// the discovery page is a public Server Component — see src/lib/supabase/service.ts.
// ---------------------------------------------------------------------------

export async function getEventBySlug(slug: string): Promise<PotEvent | null> {
  const sb = createServiceClient();
  const { data, error } = await sb.from("events").select("*").eq("slug", slug).maybeSingle();

  if (error) throw error;
  return data ? mapEvent(data) : null;
}

/** Event + confirmed roster + derived counts, for the discovery + confirmation pages. */
export async function getEventWithRoster(slug: string): Promise<EventWithRoster | null> {
  const sb = createServiceClient();

  const { data: eventRow, error: eventErr } = await sb
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (eventErr) throw eventErr;
  if (!eventRow) return null;

  const event = mapEvent(eventRow);
  const roster = await loadRoster(sb, event.id);
  const confirmedCount = roster.filter((r) => r.status === "confirmed").length;

  return {
    event,
    roster,
    confirmedCount,
    spotsLeft: Math.max(0, event.maxPlayers - confirmedCount),
  };
}

/** Confirmed RSVPs for an event, joined to player identities, ordered by position. */
async function loadRoster(
  sb: ReturnType<typeof createServiceClient>,
  eventId: string,
): Promise<RosterEntry[]> {
  const { data: rsvpRows, error: rsvpErr } = await sb
    .from("rsvps")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "confirmed")
    .order("position", { ascending: true, nullsFirst: false });
  if (rsvpErr) throw rsvpErr;

  const rsvps = (rsvpRows ?? []) as RsvpRow[];
  if (rsvps.length === 0) return [];

  const players = await loadPlayers(
    sb,
    rsvps.map((r) => r.player_id),
  );

  return rsvps.map((r) => {
    const player = players.get(r.player_id);
    return {
      rsvpId: r.id,
      playerId: r.player_id,
      displayName: player?.display_name ?? "Player",
      duprRating: player?.dupr_rating ?? null,
      position: r.position,
      paymentStatus: r.payment_status,
      status: r.status,
    };
  });
}

/** Bulk-load players into a Map keyed by id. */
async function loadPlayers(
  sb: ReturnType<typeof createServiceClient>,
  ids: string[],
): Promise<Map<string, PlayerRow>> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return new Map();

  const { data, error } = await sb.from("players").select("*").in("id", unique);
  if (error) throw error;

  return new Map((data ?? []).map((p) => [p.id, p as PlayerRow]));
}

/** Completed events with their final-match result, newest first. */
export async function getPastResults(limit = 3): Promise<PastResult[]> {
  const sb = createServiceClient();

  const { data: eventRows, error: eventErr } = await sb
    .from("events")
    .select("*")
    .eq("status", "completed")
    .order("starts_at", { ascending: false })
    .limit(limit);
  if (eventErr) throw eventErr;

  const events = (eventRows ?? []) as EventRow[];
  if (events.length === 0) return [];

  const { data: matchRows, error: matchErr } = await sb
    .from("matches")
    .select("*")
    .in(
      "event_id",
      events.map((e) => e.id),
    )
    .eq("stage", "final");
  if (matchErr) throw matchErr;

  const finals = new Map<string, MatchRow>(
    (matchRows ?? []).map((m) => [m.event_id, m as MatchRow]),
  );

  // Collect every player id referenced by a final to bulk-load names.
  const playerIds: string[] = [];
  for (const m of finals.values()) {
    playerIds.push(
      m.team_a_player1_id ?? "",
      m.team_a_player2_id ?? "",
      m.team_b_player1_id ?? "",
      m.team_b_player2_id ?? "",
    );
  }
  const players = await loadPlayers(sb, playerIds);
  const name = (id: string | null) => (id && players.get(id)?.display_name) || "TBD";

  const results: PastResult[] = [];
  for (const eventRow of events) {
    const final = finals.get(eventRow.id);
    if (!final || final.team_a_score == null || final.team_b_score == null) {
      continue;
    }

    const teamAWon = final.team_a_score >= final.team_b_score;
    const champ1 = teamAWon ? final.team_a_player1_id : final.team_b_player1_id;
    const champ2 = teamAWon ? final.team_a_player2_id : final.team_b_player2_id;
    const ru1 = teamAWon ? final.team_b_player1_id : final.team_a_player1_id;
    const ru2 = teamAWon ? final.team_b_player2_id : final.team_a_player2_id;

    results.push({
      event: mapEvent(eventRow),
      championNames: [name(champ1), name(champ2)],
      runnerUpNames: [name(ru1), name(ru2)],
      winningScore: Math.max(final.team_a_score, final.team_b_score),
      losingScore: Math.min(final.team_a_score, final.team_b_score),
    });
  }

  return results;
}

/** Confirmed-RSVP counts for a set of events, keyed by event id. */
async function getConfirmedCounts(
  sb: ReturnType<typeof createServiceClient>,
  eventIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (eventIds.length === 0) return counts;

  const { data, error } = await sb
    .from("rsvps")
    .select("event_id")
    .in("event_id", eventIds)
    .eq("status", "confirmed");
  if (error) throw error;

  for (const row of data ?? []) {
    counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
  }
  return counts;
}

/** Upcoming open events with spots-left counts, soonest first. */
export async function getUpcomingEvents(opts?: {
  excludeId?: string;
  limit?: number;
}): Promise<UpcomingEventSummary[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("events")
    .select("*")
    .in("status", ["open", "full"])
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit((opts?.limit ?? 3) + 1);
  if (error) throw error;

  let events = (data ?? []).map(mapEvent);
  if (opts?.excludeId) {
    events = events.filter((e) => e.id !== opts.excludeId);
  }
  events = events.slice(0, opts?.limit ?? 3);

  const counts = await getConfirmedCounts(
    sb,
    events.map((e) => e.id),
  );
  return events.map((event) => ({
    event,
    spotsLeft: Math.max(0, event.maxPlayers - (counts.get(event.id) ?? 0)),
  }));
}

/** Slug of the soonest open event — used to redirect the bare landing route. */
export async function getFeaturedEventSlug(): Promise<string | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("events")
    .select("slug")
    .in("status", ["open", "full"])
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.slug ?? null;
}
