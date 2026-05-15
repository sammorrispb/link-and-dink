import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Countdown } from "@/components/pot/Countdown";
import { MobileShell } from "@/components/pot/MobileShell";
import { ShareLink } from "@/components/pot/ShareLink";
import { TopBar } from "@/components/pot/TopBar";
import { Avatar, avatarColorFor } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EntryPotTiles } from "@/components/ui/EntryPotTiles";
import { Pill } from "@/components/ui/Pill";
import { formatLabel } from "@/lib/domain";
import { getEventWithRoster } from "@/lib/events";
import {
  formatCents,
  formatCountdown,
  googleCalendarUrl,
  initials,
  weekdayName,
} from "@/lib/format";
import { rsvpCookieName, verifyRsvpCookie } from "@/lib/tokens";
import { cancelRsvpAction } from "../rsvp/actions";

export const dynamic = "force-dynamic";

const BRING = [
  "🏓 Paddle (loaners available)",
  "💧 Water bottle",
  "👟 Indoor court shoes",
  "📱 Phone (you'll enter scores)",
];

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ claimed?: string }>;
}

export default async function ConfirmedPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { claimed } = await searchParams;

  const data = await getEventWithRoster(slug);
  if (!data) notFound();
  const { event, roster } = data;

  const cookieStore = await cookies();
  const payload = verifyRsvpCookie(cookieStore.get(rsvpCookieName)?.value);
  if (!payload || payload.eventId !== event.id) redirect(`/pot/${slug}/rsvp`);

  const myEntry = roster.find((r) => r.playerId === payload.playerId);
  if (!myEntry) redirect(`/pot/${slug}/rsvp`);

  const courts = Math.max(1, Math.ceil(event.maxPlayers / 4));
  const spotsOpen = Math.max(0, event.maxPlayers - roster.length);
  const calendarUrl = googleCalendarUrl({
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    location: `${event.venueName}${event.venueAddress ? `, ${event.venueAddress}` : ""}`,
    details: "The Pickleball Pot Popup by Link & Dink — RR → Single Elim. Winner takes the pot.",
  });
  const claimHref = `/claim?event=${encodeURIComponent(slug)}`;

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" backHref={`/pot/${slug}`} />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <Pill variant="solid">✓ You&apos;re in</Pill>
        <h1 className="mt-3 text-[26px] font-black leading-tight tracking-[-0.03em]">
          See you {weekdayName(event.startsAt)}.
        </h1>
        <p className="mt-1 text-[14px] leading-relaxed text-text-muted">
          Starts in{" "}
          <Countdown targetIso={event.startsAt} initialText={formatCountdown(event.startsAt)} />.
          We&apos;ll text you 30 min before.
        </p>

        {claimed ? (
          <Card variant="feature" className="mt-3">
            <p className="text-[13px] text-text">
              Profile saved — future RSVPs will pre-fill your info.
            </p>
          </Card>
        ) : null}

        <Card variant="feature" className="mt-4">
          <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-lime">
            Your Match Night
          </div>
          <div className="mt-2.5 flex justify-between">
            {[
              { label: "Format", value: formatLabel(event.format) },
              { label: "Players", value: String(event.maxPlayers) },
              { label: "Courts", value: String(courts) },
            ].map((cell) => (
              <div key={cell.label}>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">
                  {cell.label}
                </div>
                <div className="mt-0.5 text-[15px] font-extrabold text-text">{cell.value}</div>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-text-muted">
            You&apos;ll partner with everyone in your pod across the round robin, then top finishers
            advance to semis &amp; final.
          </p>
        </Card>

        <div className="mt-1.5">
          <EntryPotTiles
            entryLabel="Your entry"
            entryValue={formatCents(event.entryFeeCents)}
            entrySuffix={myEntry.paymentStatus}
            potLabel="Pot · winner take all"
            potValue={formatCents(event.potAmountCents)}
            potSuffix={event.potFunder ? `funded by ${event.potFunder}` : undefined}
            valueClassName="text-[20px]"
          />
        </div>

        <h2 className="mt-[18px] text-[13px] font-bold uppercase tracking-[0.08em] text-text-muted">
          Who&apos;s playing
        </h2>
        <Card className="mt-2 px-3.5 py-1.5">
          {roster.map((entry, i) => {
            const isYou = entry.playerId === payload.playerId;
            return (
              <div
                key={entry.rsvpId}
                className="flex items-center justify-between border-b border-border-subtle py-3 last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar color={isYou ? "lime" : avatarColorFor(i)}>
                    {isYou ? "YOU" : initials(entry.displayName)}
                  </Avatar>
                  <div>
                    <div className="text-[14px] font-extrabold text-text">{entry.displayName}</div>
                    <div className="text-[11px] text-text-dim">
                      {entry.status === "waitlist" ? "Waitlist" : isYou ? "You" : "In"}
                    </div>
                  </div>
                </div>
                <Pill variant="muted">{entry.status === "waitlist" ? "WL" : "In"}</Pill>
              </div>
            );
          })}
          {spotsOpen > 0 ? (
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] text-text-dim">
                + {spotsOpen} {spotsOpen === 1 ? "spot" : "spots"} open
              </span>
              <span className="rounded-btn border-[1.5px] border-[rgba(181,214,84,0.40)] px-3.5 py-2 text-[12px] font-extrabold text-lime">
                <ShareLink slug={event.slug} label="Invite" />
              </span>
            </div>
          ) : null}
        </Card>

        <h2 className="mt-[18px] text-[13px] font-bold uppercase tracking-[0.08em] text-text-muted">
          What to bring
        </h2>
        <Card className="mt-2 px-4 py-3">
          <div className="text-[13px] leading-[1.7] text-text">
            {BRING.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </Card>

        {!claimed ? (
          <Card className="mt-[18px]">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">
              Save your profile (optional)
            </div>
            <p className="mt-1 text-[13px] text-text-muted">
              Add an email to your player so the next RSVP is one tap.
            </p>
            <div className="mt-2">
              <Button href={claimHref} variant="secondary" size="compact">
                Save profile
              </Button>
            </div>
          </Card>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            href={calendarUrl}
            variant="ghost"
            size="compact"
            className="w-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            📅 Calendar
          </Button>
          <span className="flex items-center justify-center rounded-btn border-[1.5px] border-border-subtle bg-[rgba(255,253,250,0.04)] px-[14px] py-2 text-[12px] font-extrabold text-text">
            <ShareLink slug={event.slug} label="⤴ Share" />
          </span>
        </div>
        <div className="mt-2">
          <Button href={`/pot/${slug}`}>I&apos;m here — Check in</Button>
        </div>
        <form action={cancelRsvpAction} className="mt-2">
          <input type="hidden" name="slug" value={slug} />
          <Button type="submit" variant="danger-outline" size="compact" className="w-full">
            Cancel RSVP
          </Button>
        </form>

        <p className="mt-3 text-center text-[11px] text-text-dim">
          Disputes go to your organizer onsite.
        </p>
      </main>
    </MobileShell>
  );
}
