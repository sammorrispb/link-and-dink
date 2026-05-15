// camelCase domain types. The DB is snake_case (see src/lib/supabase/types.ts);
// these are what the rest of the app consumes. Mapping happens at the data-access
// boundary in src/lib/events.ts.

import { FORMATS as TOURNAMENT_FORMATS } from "./tournament";

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
  potFunder: string | null;
  potSplit: string;
  maxPlayers: number;
  gameLength: number | null;
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

/** Human-readable label sourced from the tournament format registry. */
export function formatLabel(format: string): string {
  const mod = TOURNAMENT_FORMATS[format as keyof typeof TOURNAMENT_FORMATS];
  return mod?.name ?? format;
}
