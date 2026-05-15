import Link from "next/link";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getOrganizedEvents } from "@/lib/events";
import { formatCents, formatEventDateTime } from "@/lib/format";
import { requireOrganizer } from "@/lib/organizer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrganizerHome() {
  const supabase = await createClient();
  const account = await requireOrganizer(supabase);
  const events = await getOrganizedEvents(account.id);

  const upcoming = events.filter((e) => ["open", "full", "in_progress"].includes(e.event.status));
  const past = events.filter((e) => ["completed", "canceled"].includes(e.event.status));

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" backHref="/pot" />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-black leading-tight tracking-[-0.03em]">Organize</h1>
            <p className="text-[13px] text-text-muted">
              Signed in as <strong className="text-text">{account.email}</strong>.
            </p>
          </div>
          <Button href="/organize/new" size="compact">
            + New event
          </Button>
        </div>

        <h2 className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-text-dim">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <p className="text-[14px] text-text-muted">
              No upcoming events yet — create one to get started.
            </p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {upcoming.map(({ event, spotsLeft }) => (
              <li key={event.id}>
                <Link href={`/organize/${event.slug}`} className="block">
                  <Card className="transition-colors hover:border-border-medium">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <div className="text-[16px] font-extrabold text-text">{event.title}</div>
                        <div className="text-[12px] text-text-muted">
                          {formatEventDateTime(event.startsAt)} · {event.venueName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-extrabold text-lime">
                          {formatCents(event.potAmountCents)}
                        </div>
                        <div className="text-[11px] text-text-dim">
                          {event.maxPlayers - spotsLeft}/{event.maxPlayers} confirmed
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {past.length > 0 ? (
          <>
            <h2 className="mb-2 mt-6 text-[12px] font-bold uppercase tracking-[0.08em] text-text-dim">
              Past
            </h2>
            <ul className="flex flex-col gap-2.5">
              {past.map(({ event }) => (
                <li key={event.id}>
                  <Link href={`/organize/${event.slug}`} className="block">
                    <Card className="opacity-80 transition-opacity hover:opacity-100">
                      <div className="flex items-baseline justify-between gap-3">
                        <div>
                          <div className="text-[15px] font-extrabold text-text">{event.title}</div>
                          <div className="text-[11px] text-text-muted">
                            {formatEventDateTime(event.startsAt)} · {event.status}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </main>
    </MobileShell>
  );
}
