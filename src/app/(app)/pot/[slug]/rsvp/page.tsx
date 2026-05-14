import { notFound, redirect } from "next/navigation";
import { MobileShell } from "@/components/pot/MobileShell";
import { SignInForm } from "@/components/pot/SignInForm";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EntryPotTiles } from "@/components/ui/EntryPotTiles";
import { ensureAccount, getLinkedPlayers } from "@/lib/account";
import { formatLabel } from "@/lib/domain";
import { getEventWithRoster } from "@/lib/events";
import { formatCents, formatEventDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { rsvpAction } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RsvpPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getEventWithRoster(slug);
  if (!data) notFound();
  const { event } = data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in -> inline magic-link sign-in, returns here afterwards.
  if (!user) {
    return (
      <MobileShell>
        <TopBar brand="pot-night" icon="⌃" backHref={`/pot/${slug}`} />
        <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
          <h1 className="mb-1 text-[26px] font-black leading-tight tracking-[-0.03em]">
            Enter the pot
          </h1>
          <p className="mb-4 text-[14px] text-text-muted">
            {formatEventDateTime(event.startsAt)} · {event.venueName}
          </p>
          <SignInForm redirectTo={`/pot/${slug}/rsvp`} />
        </main>
      </MobileShell>
    );
  }

  const account = await ensureAccount(supabase);
  const players = await getLinkedPlayers(supabase, account.id);
  const primaryPlayer = players[0] ?? null;

  // Already RSVP'd this event -> straight to the confirmation page.
  const { data: existingRsvp } = await supabase
    .from("rsvps")
    .select("id")
    .eq("event_id", event.id)
    .eq("account_id", account.id)
    .neq("status", "canceled")
    .maybeSingle();
  if (existingRsvp) redirect(`/pot/${slug}/confirmed`);

  const bracket = event.bracket.replace("-", "–");

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <h1 className="mb-1 text-[26px] font-black leading-tight tracking-[-0.03em]">
          Enter the pot
        </h1>
        <p className="mb-4 text-[14px] text-text-muted">You&apos;re signed in. One step left.</p>

        {/* Event summary */}
        <Card variant="feature" className="mb-3">
          <h2 className="text-[20px] font-black tracking-[-0.02em] text-text">
            {formatEventDateTime(event.startsAt)}
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">
            <strong className="text-text">{event.venueName}</strong>
            {event.venueAddress ? ` · ${event.venueAddress}` : null}
            <br />
            Level: {bracket} DUPR · Format: {formatLabel(event.format)}
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
        </Card>

        <form action={rsvpAction} className="flex flex-col gap-3">
          <input type="hidden" name="slug" value={slug} />

          {primaryPlayer ? (
            <>
              <input type="hidden" name="playerId" value={primaryPlayer.id} />
              <Card>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">
                  Playing as
                </div>
                <div className="mt-1 text-[16px] font-extrabold text-text">
                  {primaryPlayer.display_name}
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">
                Create your player
              </div>
              <label className="mt-2 block text-[12px] text-text-muted" htmlFor="playerName">
                Name
              </label>
              <input
                id="playerName"
                name="playerName"
                required
                placeholder="First L."
                className="mt-1 w-full rounded-btn border border-border-medium bg-surface-2 px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-dim focus:border-lime focus:outline-none"
              />
              <label className="mt-3 block text-[12px] text-text-muted" htmlFor="duprId">
                DUPR ID <span className="text-text-dim">(optional)</span>
              </label>
              <input
                id="duprId"
                name="duprId"
                placeholder="e.g. DUPR-12345"
                className="mt-1 w-full rounded-btn border border-border-medium bg-surface-2 px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-dim focus:border-lime focus:outline-none"
              />
            </Card>
          )}

          <Button type="submit">Confirm RSVP — {formatCents(event.entryFeeCents)}</Button>
          <p className="text-center text-[11px] text-text-dim">
            Phase 1: your entry is recorded as intent — no card is charged yet.
          </p>
        </form>
      </main>
    </MobileShell>
  );
}
