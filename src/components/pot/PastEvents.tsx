import { Card } from "@/components/ui/Card";
import { DateTag } from "@/components/ui/DateTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { PastResult } from "@/lib/domain";
import { formatCents, formatDateTag } from "@/lib/format";

export function PastEvents({ results }: { results: PastResult[] }) {
  // For the genuine first Pot Night there is nothing to show yet — swap in the
  // inaugural-cohort empty state (designer's note).
  if (results.length === 0) {
    return (
      <section>
        <SectionHeader eyebrow="Past Pot Nights" title="Be one of the inaugural 8." />
        <Card>
          <p className="text-[13px] leading-relaxed text-text-muted">
            No Pot Nights in the books yet. The first cohort sets the bar — show up, play, and your
            result lands here.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader eyebrow="Past Pot Nights" title="What just happened." />
      <Card className="px-3.5 py-1">
        {results.map((result, i) => {
          const tag = formatDateTag(result.event.startsAt);
          const partner = result.championNames[1];
          return (
            <div
              key={result.event.id}
              className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 py-3 ${
                i < results.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              <DateTag month={tag.month} day={tag.day} />
              <div>
                <div className="text-[13px] font-bold text-text">
                  {result.championNames[0]} takes the pot
                </div>
                <div className="text-[11px] text-text-muted">
                  {result.winningScore}–{result.losingScore} final
                  {partner ? ` · partnered with ${partner}` : ""} · {result.event.venueName}
                </div>
              </div>
              <div className="text-[14px] font-black text-lime">
                {formatCents(result.event.potAmountCents)}
              </div>
            </div>
          );
        })}
      </Card>
      <div className="mt-2 text-center">
        <span className="text-[12px] font-bold text-lime">View all results →</span>
      </div>
    </section>
  );
}
