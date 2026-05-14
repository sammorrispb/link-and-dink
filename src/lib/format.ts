// Date + money formatting helpers. All event times are stored with their
// timezone offset; we render in US Eastern (the DMV) for consistency.

const TZ = "America/New_York";

/** 1000 -> "$10", 8000 -> "$80", 1250 -> "$12.50" */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** "Tue, May 26 · 7:30 PM" */
export function formatEventDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

/** "Tue · 7:30 PM" — compact form for list rows. */
export function formatEventDayTime(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" });
  const time = d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
}

/** { month: "May", day: "26" } — for the date-tag component. */
export function formatDateTag(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  return {
    month: d.toLocaleDateString("en-US", { timeZone: TZ, month: "short" }),
    day: d.toLocaleDateString("en-US", { timeZone: TZ, day: "numeric" }),
  };
}

/**
 * Countdown string from now to the target time.
 * "2 days, 4 hrs, 19 min" — or "Starting now" once the event has begun.
 */
export function formatCountdown(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  if (diffMs <= 0) return "Starting now";

  const totalMin = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hrs = Math.floor((totalMin % (60 * 24)) / 60);
  const min = totalMin % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hrs > 0 || days > 0) parts.push(`${hrs} ${hrs === 1 ? "hr" : "hrs"}`);
  parts.push(`${min} min`);
  return parts.join(", ");
}

/** "Sarah K." -> "Sarah" */
export function firstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}

/** Weekday name for an event time, e.g. "Tuesday". */
export function weekdayName(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "long",
  });
}

/** "Add to Google Calendar" template URL for an event. */
export function googleCalendarUrl(opts: {
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  details: string;
}): string {
  const fmt = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const end = opts.endsAt
    ? opts.endsAt
    : new Date(new Date(opts.startsAt).getTime() + 90 * 60_000).toISOString();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(opts.startsAt)}/${fmt(end)}`,
    location: opts.location,
    details: opts.details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** "Sarah K." -> "SK", "DJ" -> "DJ", "Priya N." -> "PN" */
export function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
