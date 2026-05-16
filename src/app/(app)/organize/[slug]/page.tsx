import { notFound } from "next/navigation";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { ballColorFor, formatLabel } from "@/lib/domain";
import { getRosterForExport } from "@/lib/events";
import { formatCents, formatEventDateTime } from "@/lib/format";
import { requireOrganizer } from "@/lib/organizer";
import { createClient } from "@/lib/supabase/server";
import { rosterTokenFor } from "@/lib/tokens";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export default async function OrganizerEventDashboard({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const account = await requireOrganizer(supabase);

  const data = await getRosterForExport(slug, { includeCanceled: true });
  if (!data) notFound();
  const { event, rows } = data;
  if (event.organizerAccountId !== account.id) notFound();

  const base = siteUrl();
  const rsvpLink = `${base}/pot/${event.slug}/rsvp`;
  const publicLink = `${base}/pot/${event.slug}`;
  const rosterToken = rosterTokenFor(event.id);

  const confirmed = rows.filter((r) => r.rsvpStatus === "confirmed");
  const waitlist = rows.filter((r) => r.rsvpStatus === "waitlist");
  const canceled = rows.filter((r) => r.rsvpStatus === "canceled");

  const namesOnePerLine = confirmed.map((r) => r.displayName).join("\n");
  const reminderText =
    `Pot Night tonight — ${formatEventDateTime(event.startsAt)} at ${event.venueName}. ` +
    `${event.maxPlayers}-player bracket, ${formatCents(event.potAmountCents)} pot, winner take all. ` +
    `Tap here: ${publicLink}`;

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" backHref="/organize" />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <h1 className="mb-1 text-[24px] font-black leading-tight tracking-[-0.03em]">
          {event.title}
        </h1>
        <p className="mb-4 text-[13px] text-text-muted">
          {formatEventDateTime(event.startsAt)} · {event.venueName}
          {event.venueAddress ? ` · ${event.venueAddress}` : ""}
        </p>

        <Card variant="feature" className="mb-3">
          <div className="grid grid-cols-2 gap-3 text-[13px] text-text-muted">
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-text-dim">Pot</div>
              <div className="text-[18px] font-extrabold text-text">
                {formatCents(event.potAmountCents)}
              </div>
              <div className="text-[11px] text-text-dim">Funded by {event.potFunder ?? "—"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-text-dim">Format</div>
              <div className="text-[15px] font-extrabold text-text">
                {formatLabel(event.format)}
              </div>
              <div className="text-[11px] text-text-dim">
                Games to {event.gameLength ?? 11} ·{" "}
                {event.ageBracket
                  ? `${event.ageBracket} · ${ballColorFor(event.ageBracket)}`
                  : event.bracket}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-text-dim">Confirmed</div>
              <div className="text-[18px] font-extrabold text-text">
                {confirmed.length}/{event.maxPlayers}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-text-dim">Status</div>
              <div className="text-[15px] font-extrabold capitalize text-text">{event.status}</div>
            </div>
          </div>
        </Card>

        <div className="mb-3 flex flex-wrap gap-2">
          <CopyButton text={rsvpLink} label="Copy RSVP link" />
          <CopyButton text={publicLink} label="Copy public link" />
          <CopyButton text={reminderText} label="Copy reminder text" />
          <CopyButton text={namesOnePerLine} label="Copy roster (names)" variant="primary" />
          <Button href={`/api/events/${event.slug}/roster.csv`} variant="ghost" size="compact">
            Download CSV
          </Button>
          <Button href={publicLink} variant="ghost" size="compact">
            View public page
          </Button>
        </div>

        <Card className="mb-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">
            Tournament tool import
          </div>
          <p className="mt-1 text-[13px] text-text-muted">
            Paste these into popup.html → Roster → Import → From L&amp;D.
          </p>
          <dl className="mt-2 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1 text-[13px]">
            <dt className="text-text-dim">Slug</dt>
            <dd className="break-all font-mono text-text">{event.slug}</dd>
            <dt className="text-text-dim">Token</dt>
            <dd className="break-all font-mono text-text">{rosterToken}</dd>
          </dl>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyButton text={event.slug} label="Copy slug" />
            <CopyButton text={rosterToken} label="Copy token" />
          </div>
        </Card>

        <h2 className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-[0.08em] text-text-dim">
          Roster ({confirmed.length} confirmed · {waitlist.length} waitlist
          {canceled.length > 0 ? ` · ${canceled.length} canceled` : ""})
        </h2>
        {rows.length === 0 ? (
          <Card>
            <p className="text-[13px] text-text-muted">No RSVPs yet — share the link above.</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {[...confirmed, ...waitlist, ...canceled].map((r) => (
              <li key={r.rsvpId}>
                <Card>
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-extrabold text-text">
                        {r.displayName}
                        {r.rsvpStatus !== "confirmed" ? (
                          <span className="ml-2 text-[11px] uppercase tracking-[0.06em] text-text-dim">
                            {r.rsvpStatus}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {r.phone ?? "—"} · {r.venmoHandle ? `@${r.venmoHandle}` : "no Venmo"}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-text-dim">
                      {r.position ? `#${r.position}` : ""}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </MobileShell>
  );
}
