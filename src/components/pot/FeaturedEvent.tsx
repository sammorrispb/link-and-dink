import { Avatar, AvatarStack, avatarColorFor } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EntryPotTiles } from "@/components/ui/EntryPotTiles";
import { Pill } from "@/components/ui/Pill";
import type { PotEvent, RosterEntry } from "@/lib/domain";
import { ballColorFor, formatLabel } from "@/lib/domain";
import { firstName, formatCents, formatEventDateTime, initials } from "@/lib/format";

export function FeaturedEvent({
  event,
  roster,
  confirmedCount,
  spotsLeft,
}: {
  event: PotEvent;
  roster: RosterEntry[];
  confirmedCount: number;
  spotsLeft: number;
}) {
  const preview = roster.slice(0, 4);
  const names = preview.map((r) => firstName(r.displayName));
  const bracket = event.bracket.replace("-", "–");
  const levelLabel = event.ageBracket
    ? `${event.ageBracket} · ${ballColorFor(event.ageBracket)}`
    : `${bracket} DUPR`;

  return (
    <Card variant="feature" className="mb-4">
      <div className="mb-3 flex items-center justify-between border-b border-[rgba(181,214,84,0.12)] pb-2.5">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-lime">
          Next up
        </span>
        <Pill variant="solid" className="text-[10px]">
          {spotsLeft} of {event.maxPlayers} spots left
        </Pill>
      </div>

      <h2 className="text-[22px] font-black tracking-[-0.02em] text-text">
        {formatEventDateTime(event.startsAt)}
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
        <strong className="text-text">{event.venueName}</strong>
        {event.venueAddress ? ` · ${event.venueAddress}` : null}
        <br />
        Level: {levelLabel} · Format: {formatLabel(event.format)}
      </p>

      <div className="my-3.5">
        <EntryPotTiles
          entryLabel="Entry"
          entryValue={formatCents(event.entryFeeCents)}
          potLabel="Pot · winner take all"
          potValue={formatCents(event.potAmountCents)}
        />
      </div>

      {confirmedCount > 0 ? (
        <div className="mb-3 flex items-center gap-2">
          <AvatarStack>
            {preview.map((r, i) => (
              <Avatar key={r.rsvpId} size="sm" color={avatarColorFor(i)}>
                {initials(r.displayName)}
              </Avatar>
            ))}
          </AvatarStack>
          <span className="ml-1.5 text-[11px] text-text-muted">
            {formatRosterCaption(names, confirmedCount)}
          </span>
        </div>
      ) : (
        <p className="mb-3 text-[11px] text-text-muted">
          Be one of the inaugural 8 — no one&apos;s in yet.
        </p>
      )}

      <Button href={`/pot/${event.slug}/rsvp`}>
        Enter the pot — {formatCents(event.entryFeeCents)}
      </Button>
    </Card>
  );
}

function formatRosterCaption(names: string[], total: number): string {
  if (names.length === 0) return "";
  const verb = total === 1 ? "is" : "are";
  if (total <= names.length) {
    return `${joinNames(names)} ${verb} in`;
  }
  return `${joinNames(names)} + ${total - names.length} more ${verb} in`;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return names.join(", ");
}
