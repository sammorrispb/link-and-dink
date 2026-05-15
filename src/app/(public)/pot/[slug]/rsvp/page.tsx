import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EntryPotTiles } from "@/components/ui/EntryPotTiles";
import { formatLabel } from "@/lib/domain";
import { getEventWithRoster } from "@/lib/events";
import { formatCents, formatEventDateTime } from "@/lib/format";
import { rsvpCookieName, verifyRsvpCookie } from "@/lib/tokens";
import { rsvpAction } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-btn border border-border-medium bg-surface-2 px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-dim focus:border-lime focus:outline-none";
const labelClass = "mt-3 block text-[12px] text-text-muted";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RsvpPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getEventWithRoster(slug);
  if (!data) notFound();
  const { event, confirmedCount, spotsLeft } = data;

  const cookieStore = await cookies();
  const payload = verifyRsvpCookie(cookieStore.get(rsvpCookieName)?.value);
  if (payload?.eventId === event.id) redirect(`/pot/${slug}/confirmed`);

  const isFull = confirmedCount >= event.maxPlayers;
  const bracket = event.bracket.replace("-", "–");

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" backHref={`/pot/${slug}`} />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <h1 className="mb-1 text-[26px] font-black leading-tight tracking-[-0.03em]">
          {isFull ? "Hop on the waitlist" : "Enter the pot"}
        </h1>
        <p className="mb-4 text-[14px] text-text-muted">
          {formatEventDateTime(event.startsAt)} · {event.venueName}
        </p>

        <Card variant="feature" className="mb-3">
          <h2 className="text-[20px] font-black tracking-[-0.02em] text-text">
            {formatEventDateTime(event.startsAt)}
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">
            <strong className="text-text">{event.venueName}</strong>
            {event.venueAddress ? ` · ${event.venueAddress}` : null}
            <br />
            Level: {bracket} · Format: {formatLabel(event.format)} · Games to{" "}
            {event.gameLength ?? 11}
          </p>
          <div className="mt-3.5">
            <EntryPotTiles
              entryLabel="Entry"
              entryValue={formatCents(event.entryFeeCents)}
              potLabel="Pot · winner take all"
              potValue={formatCents(event.potAmountCents)}
              valueClassName="text-[20px]"
            />
          </div>
          {isFull ? (
            <p className="mt-3 text-[12px] text-text-dim">
              All {event.maxPlayers} confirmed spots are filled. You&apos;ll move up automatically
              if someone cancels.
            </p>
          ) : (
            <p className="mt-3 text-[12px] text-text-dim">
              {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left.
            </p>
          )}
        </Card>

        <form action={rsvpAction} className="flex flex-col gap-3">
          <input type="hidden" name="slug" value={slug} />

          <Card>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="first_name">
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  placeholder="Devon"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="last_name">
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  placeholder="Johnson"
                  className={inputClass}
                />
              </div>
            </div>

            <label className={labelClass} htmlFor="phone">
              Phone <span className="text-text-dim">(US)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="(301) 555-1234"
              className={inputClass}
            />

            <label className={labelClass} htmlFor="venmo_handle">
              Venmo handle <span className="text-text-dim">(needed in case you win)</span>
            </label>
            <input
              id="venmo_handle"
              name="venmo_handle"
              required
              autoComplete="username"
              placeholder="@yourhandle"
              className={inputClass}
            />

            <label className={labelClass} htmlFor="email">
              Email <span className="text-text-dim">(optional — for receipts)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              className={inputClass}
            />
          </Card>

          <Button type="submit">{isFull ? "Join the waitlist" : "I'm in"}</Button>
          <p className="text-center text-[11px] text-text-dim">
            By RSVP&apos;ing you accept the friendly-bracket rules — organizer&apos;s call is final.
          </p>
        </form>
      </main>
    </MobileShell>
  );
}
