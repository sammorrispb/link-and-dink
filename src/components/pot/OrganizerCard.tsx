import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Static in Phase 1 — the organizer's DUPR / events-run / host-rating stats
// aren't modeled in the DB yet (Phase 2). See PHASE_1_COMPLETE.md.
const STATS = [
  { value: "3.85", label: "DUPR" },
  { value: "12", label: "Events run" },
  { value: "96", label: "Players hosted" },
  { value: "4.9", label: "Host rating" },
];

export function OrganizerCard() {
  return (
    <section>
      <SectionHeader eyebrow="Your host" title="Coach Up organizer · Sam M." />
      <div className="rounded-card border border-border-subtle bg-surface-2 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b5d654,#b5aff1)] text-[18px] font-black text-green-black">
            SM
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-text">Sam Morris</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-lime">
              Coach Up · DMV
            </div>
          </div>
        </div>

        <blockquote className="my-3 border-l-2 border-border-medium pl-3 text-[13px] italic leading-relaxed text-text-muted">
          &ldquo;P3 is for the games I always wanted to play on a Tuesday but couldn&apos;t find.
          Real bracket, real stakes, real people. No pickup-game limbo.&rdquo;
        </blockquote>

        <div className="flex justify-between border-y border-border-subtle py-2.5">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[16px] font-black text-text">{stat.value}</div>
              <div className="text-[9px] uppercase tracking-wide text-text-dim">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <Button href="/pot" variant="secondary" size="compact" className="w-full">
            Message Sam
          </Button>
        </div>
      </div>
    </section>
  );
}
