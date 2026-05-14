import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const PATHS = [
  {
    badge: "A",
    title: "DUPR-verified",
    desc: "DUPR rating with reliability ≥70 unlocks your bracket. Connect your DUPR and RSVP straight through.",
  },
  {
    badge: "B",
    title: "Coach-evaluated",
    desc: "Free 30-min eval with a certified Link & Dink coach. Your rating gets added to your profile and unlocks brackets for a year.",
  },
];

export function WhoCanPlay() {
  return (
    <section>
      <SectionHeader eyebrow="Who can play" title="Eval-gated. We match level." />
      <Card>
        <div className="flex flex-col gap-4">
          {PATHS.map((path) => (
            <div key={path.badge} className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[rgba(181,214,84,0.18)] text-[13px] font-extrabold text-lime">
                {path.badge}
              </div>
              <div>
                <div className="text-[14px] font-extrabold text-text">{path.title}</div>
                <div className="mt-0.5 text-[12px] leading-normal text-text-muted">{path.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-subtle pt-4">
          <Button href="/pot" variant="secondary" size="compact" className="w-full">
            Book a free eval
          </Button>
          <Button href="/pot" variant="ghost" size="compact" className="w-full">
            Connect DUPR
          </Button>
        </div>
      </Card>
      <Callout className="mt-2.5" lead="For the inaugural cohort:">
        Your Pot Night performance sets your starting bracket. Show up, play, get rated. The gate
        kicks in for the 4th week onward.
      </Callout>
    </section>
  );
}
