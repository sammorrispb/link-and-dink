// Static content for the Coach Up surfaces. Copy lifted from the briefing +
// coach-up-mockup-v1.html; the mockup is a content reference, not a layout
// reference (Coach Up renders in the Pot Night mobile shell).

export const WORK_TYPES = [
  {
    num: "1",
    title: "Run events",
    body: "Pickup sessions, Pot Nights, ladders, socials. Sam books the court. You bring the energy and run the room.",
  },
  {
    num: "2",
    title: "Coach lessons",
    body: "1:1 and small-group private instruction. Set your own rate. We send you students. You keep what you earn.",
  },
  {
    num: "3",
    title: "Run clinics",
    body: "Skills-focused group sessions — drilling, strategy, level-specific. Sam helps you design the curriculum.",
  },
] as const;

export const REV_CARDS = [
  {
    label: "Lessons",
    split: "100%",
    surface: "Your earnings",
    body: "1:1 and small-group private instruction. L&D takes zero.",
    highlight: true,
  },
  {
    label: "Clinics",
    split: "100%",
    surface: "Your earnings",
    body: "Drilling, strategy, level-specific group sessions. L&D takes zero.",
    highlight: true,
  },
  {
    label: "Events",
    split: "100→50%",
    surface: "Tiered by court cost",
    body: "L&D takes a share only on events — and only where we're paying for the court.",
    highlight: false,
  },
] as const;

export const EVENT_TIERS = [
  {
    court: "Free outdoor public (most MoCo parks)",
    cost: "$0",
    fee: "$5–10",
    take: "100%",
  },
  {
    court: "Low-cost outdoor paid",
    cost: "~$10/ct/hr",
    fee: "$10–15",
    take: "80% after court",
  },
  {
    court: "Premium indoor (Bauer Drive, Pickleball Zone)",
    cost: "~$40/ct/hr",
    fee: "$20–30",
    take: "50% after court",
  },
] as const;

export const COHORT_POINTS = [
  {
    lead: "12-week structured roadmap.",
    rest: "No \"here's a basket of balls, good luck.\" Onboarding has a sequence, and you'll know what week 5 looks like before you start.",
  },
  {
    lead: "Weekly 1:1 with Sam.",
    rest: "Post-event debriefs, lesson-plan reviews, dealing with the awkward player, business questions.",
  },
  {
    lead: "Peer cohort.",
    rest: "Two other apprentices in your same season. Group thread, shared wins, accountability.",
  },
  {
    lead: "Real reps from week 1.",
    rest: "You'll be running events the second week. Mentorship without reps is a workshop, not an apprenticeship.",
  },
] as const;

export const FIT = [
  "You're a 3.5+ player who already gets stopped by friends asking for tips at open play",
  "You want to teach for real, not as a side gig that fizzles in three months",
  "You'd rather earn while learning than pay tuition and DIY your client list",
  "You can commit ~5–10 hours a week for 12 weeks",
  "You live in the DMV (launching in MoCo)",
] as const;

export const NOT_FIT = [
  "You want a fast PPR cert and a job board — go straight to PPR",
  "You're not comfortable being coached in front of your cohort",
  "You expect L&D to find every student and book every lesson",
  "You're already running a coaching business and want a referral program",
  "You're outside the DMV and not planning to relocate",
] as const;

export const COACH_CREDS = [
  "Master's in coaching",
  "4.83 DUPR",
  "A decade coaching",
  "Next Gen Pickleball Academy",
] as const;

export const FAQS = [
  {
    q: "Do I need to be certified to start?",
    a: "No. We recommend cert once you're running real events for the insurance, but you don't need it on day one. You'll get reps with Sam before you ever run a session alone.",
  },
  {
    q: "How much can I actually earn?",
    a: "It depends on how much you teach. Realistically, a Coach Up member running 2 events + 4 lessons + 1 clinic a week is looking at meaningful side-income inside 60 days. We track your earnings ledger in the dashboard so you can see it growing.",
  },
  {
    q: "How many hours a week is this?",
    a: "Plan for 5–10 hours/week for the 12-week cohort: 2–4 hours running events, 1–3 hours on lessons or clinics you publish, 1 hour 1:1 with Sam, plus prep. You can scale up after.",
  },
  {
    q: "Do I have to be in MoCo?",
    a: "First cohort, yes — that's our launch wedge. Future cohorts expand to broader DMV (DC, NoVa, Baltimore).",
  },
  {
    q: "What if I want to drop out mid-cohort?",
    a: "No penalty, no clawback. Coach Up is an apprenticeship, not a contract. We'd rather you tell us early than ghost.",
  },
  {
    q: "What does Sam actually do as my mentor?",
    a: "Weekly 1:1 (in person when possible, video when not). Post-event debriefs. Lesson-plan reviews. Sometimes he just shows up to your event and watches. Always honest, always specific.",
  },
  {
    q: "When does the next cohort start?",
    a: "Cohort #1 is forming now. Apply and we'll let you know within 5 days where you stand. If you're a fit and the cohort is full, we'll hold a spot for #2.",
  },
  {
    q: "What if I'm already a coach somewhere else?",
    a: "Reply with your situation. We're not trying to steal anyone's day job. Coach Up is compatible with most existing club/coach setups, but we want the conversation up front.",
  },
] as const;

// --- Apply form options -----------------------------------------------------

export const YEARS_OPTIONS = ["< 1 year", "1–2 years", "2–4 years", "4+ years"] as const;
export const HOURS_OPTIONS = ["3–5 hours", "5–10 hours", "10–15 hours", "15+ hours"] as const;
export const WEEKEND_OPTIONS = ["Most weekends", "Some weekends", "Weekdays only"] as const;
export const COMMIT_OPTIONS = [
  "Yes — count me in",
  "Probably yes — small concerns I'd want to discuss",
  "Unsure — let's talk",
] as const;

// --- Mock dashboard data (v1: shape only, no member concept yet) ------------

export const DASH_MEMBER = {
  firstName: "Jordan",
  cohortLabel: "Cohort #1 · Week 3 of 12",
} as const;

export const DASH_THIS_WEEK = [
  {
    kind: "1:1 with Sam",
    title: "Post-event debrief",
    when: "Thu May 21 · 6:00pm ET · Coffee on Wisconsin",
    note: "Bring your Tuesday pickup notes. We'll dig into the 3.5 player who's stuck on the third shot drop.",
    cta: "Confirm",
  },
  {
    kind: "Event to run",
    title: "Wednesday pickup · Olney",
    when: "Wed May 27 · 6:30pm ET · Free public courts",
    note: "6–8 players RSVPed. Free outdoor — 100% of fees are yours.",
    cta: "Claim event",
  },
] as const;

export type CourtTier = "free" | "low" | "premium";

export const DASH_OPEN_EVENTS: {
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
    venue: "Pike District",
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

export const DASH_MENTOR_LOG = [
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
] as const;

export const DASH_CERT = {
  pathway: "PPR Certified Coach",
  detail: "Studying for written",
  status: "In progress",
} as const;

export const DASH_EARNINGS = {
  month: "May 2026",
  cells: [
    { label: "Events", amt: "$340", hours: "4 sessions" },
    { label: "Lessons", amt: "$720", hours: "12 hours" },
    { label: "Clinics", amt: "$200", hours: "1 clinic" },
  ],
} as const;
