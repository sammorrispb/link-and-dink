import { Button } from "@/components/ui/Button";
import type { PotEvent } from "@/lib/domain";
import { formatCents, formatEventDateTime } from "@/lib/format";
import { ShareLink } from "./ShareLink";

export function FinalCta({ event, spotsLeft }: { event: PotEvent; spotsLeft: number }) {
  return (
    <section className="mt-1.5">
      <div className="rounded-card border border-border-medium bg-[linear-gradient(160deg,#07332a_0%,#044026_100%)] p-[18px] text-center">
        <h3 className="text-[18px] font-black text-text">Ready to get paid?</h3>
        <p className="mt-1 text-[13px] text-text-muted">
          {formatEventDateTime(event.startsAt)} · {event.venueName} · {spotsLeft}{" "}
          {spotsLeft === 1 ? "spot" : "spots"} left
        </p>
        <div className="mt-3.5">
          <Button href={`/pot/${event.slug}/rsvp`}>
            Enter the pot — {formatCents(event.entryFeeCents)}
          </Button>
        </div>
        <div className="mt-3">
          <ShareLink slug={event.slug} />
        </div>
      </div>
    </section>
  );
}
