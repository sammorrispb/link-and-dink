// camelCase domain types. The DB is snake_case (see src/lib/supabase/types.ts);
// these are what the rest of the app consumes. Mapping happens at the data-access
// boundary in src/lib/events.ts.

export type EventStatus = "open" | "full" | "in_progress" | "completed" | "canceled";

export interface PotEvent {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  venueName: string;
  venueAddress: string | null;
  bracket: string;
  format: string;
  entryFeeCents: number;
  potAmountCents: number;
  potSplit: string;
  maxPlayers: number;
  organizerAccountId: string;
  status: EventStatus;
}

export interface RosterEntry {
  rsvpId: string;
  playerId: string;
  displayName: string;
  duprRating: number | null;
  position: number | null;
  paymentStatus: string;
  status: string;
}

export interface EventWithRoster {
  event: PotEvent;
  roster: RosterEntry[];
  confirmedCount: number;
  spotsLeft: number;
}

export interface PastResult {
  event: PotEvent;
  championNames: string[];
  runnerUpNames: string[];
  winningScore: number;
  losingScore: number;
}

export interface UpcomingEventSummary {
  event: PotEvent;
  spotsLeft: number;
}

/** Human-readable label for the locked v1 format. */
export function formatLabel(format: string): string {
  return format === "rr_se_8p" ? "RR → Single Elim" : format;
}
