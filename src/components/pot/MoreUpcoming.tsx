import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DateTag } from "@/components/ui/DateTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { UpcomingEventSummary } from "@/lib/domain";
import { formatDateTag, formatEventDayTime } from "@/lib/format";

export function MoreUpcoming({ events }: { events: UpcomingEventSummary[] }) {
  if (events.length === 0) return null;

  return (
    <section>
      <SectionHeader eyebrow="More upcoming" title="Plan your Tuesdays." />
      <Card className="px-3.5 py-1">
        {events.map(({ event, spotsLeft }, i) => {
          const tag = formatDateTag(event.startsAt);
          const bracket = event.bracket.replace("-", "–");
          return (
            <Link
              key={event.id}
              href={`/pot/${event.slug}`}
              className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 py-3 ${
                i < events.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              <DateTag month={tag.month} day={tag.day} />
              <div>
                <div className="text-[13px] font-bold text-text">
                  {formatEventDayTime(event.startsAt)}
                </div>
                <div className="text-[11px] text-text-muted">
                  {event.venueName} · {bracket}
                </div>
              </div>
              <div className="text-[11px] font-bold text-lime">{spotsLeft} open</div>
            </Link>
          );
        })}
      </Card>
    </section>
  );
}
