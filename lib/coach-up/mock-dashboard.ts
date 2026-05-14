/**
 * Seeded mock data for the Coach Up member dashboard (v1).
 *
 * The dashboard renders the *shape* of the member experience — real
 * per-member data lands when the product app and `coach_up_members` table
 * are built. Values lifted from coach-up-mockup-v1.html.
 */

export const MEMBER = {
  firstName: "Jordan",
  cohortLabel: "Cohort #1 · Week 3 of 12",
};

export type CourtTier = "free" | "low" | "premium";

export const THIS_WEEK = [
  {
    kind: "1:1 with Sam",
    title: "Post-event debrief",
    when: "Thu May 21 · 6:00pm ET · Coffee on Wisconsin",
    note: "Bring your Tuesday pickup notes. We'll dig into the 3.5 player who's stuck on the third shot drop.",
    cta: "Confirm →",
  },
  {
    kind: "Event to run",
    title: "Wednesday pickup · Olney",
    when: "Wed May 27 · 6:30pm ET · Free public courts",
    note: "6–8 players RSVPed. Free outdoor — 100% of fees are yours.",
    cta: "Claim event →",
  },
];

export const OPEN_EVENTS: {
  date: string;
  venue: string;
  tier: CourtTier;
  tierLabel: string;
  fee: string;
  rsvps: string;
  take: string;
}[] = [
  {
    date: "Tue May 26",
    venue: "Olney public courts",
    tier: "free",
    tierLabel: "Free outdoor",
    fee: "$10",
    rsvps: "6/8",
    take: "$80",
  },
  {
    date: "Thu May 28",
    venue: "Pike District (outdoor paid)",
    tier: "low",
    tierLabel: "Low-cost",
    fee: "$15",
    rsvps: "4/8",
    take: "$48",
  },
  {
    date: "Sat May 30",
    venue: "Bauer Drive (indoor)",
    tier: "premium",
    tierLabel: "Premium",
    fee: "$25",
    rsvps: "7/8",
    take: "$60",
  },
  {
    date: "Sun May 31",
    venue: "Wheaton public courts",
    tier: "free",
    tierLabel: "Free outdoor",
    fee: "$10",
    rsvps: "3/8",
    take: "$30",
  },
];

export const MENTOR_LOG = [
  {
    date: "May 14",
    tags: ["Strategy", "Coaching"],
    note: "“You're feeding too predictably in the drilling block — vary the angle every third ball. Players adapt faster than you think.”",
  },
  {
    date: "May 7",
    tags: ["Business"],
    note: "“Don't price your first 10 lessons low — price at $60/hr and over-deliver. Discounts train clients to expect them.”",
  },
  {
    date: "May 1",
    tags: ["Drilling"],
    note: "“For the 3.0 player, the dink rally drill needs a target — a cone, a court line, anything. Aimless dinks aren't a drill.”",
  },
];

export const CERT = {
  pathway: "PPR Certified Coach",
  detail: "Studying for written",
  status: "In progress",
};

export const EARNINGS = {
  month: "May 2026",
  cells: [
    { label: "Events", amt: "$340", hours: "4 sessions" },
    { label: "Lessons", amt: "$720", hours: "12 hours" },
    { label: "Clinics", amt: "$200", hours: "1 clinic" },
  ],
};
