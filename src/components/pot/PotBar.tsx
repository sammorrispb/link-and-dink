import { Callout } from "@/components/ui/Callout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { PotEvent } from "@/lib/domain";
import { formatCents } from "@/lib/format";

export function PotBar({ event }: { event: PotEvent }) {
  const perWinnerCents = Math.round(event.potAmountCents / 2);
  const netProfitCents = perWinnerCents - event.entryFeeCents;

  return (
    <section>
      <SectionHeader
        eyebrow="The pot"
        title={`${formatCents(event.potAmountCents)}. Winner takes all.`}
      />
      <div className="overflow-hidden rounded-[10px]">
        <div className="bg-lime px-2.5 py-3 text-center text-action-text">
          <div className="text-[20px] font-black">{formatCents(event.potAmountCents)}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] opacity-75">
            Champion pair · {formatCents(perWinnerCents)} each
          </div>
        </div>
      </div>
      <Callout className="mt-2.5" lead="Pure player pot.">
        {event.maxPlayers} players × {formatCents(event.entryFeeCents)} entry ={" "}
        {formatCents(event.potAmountCents)}. The champion pair walks away with all of it —{" "}
        {formatCents(perWinnerCents)} per winner, net {formatCents(netProfitCents)} profit each. No
        sponsor, no rake, no fees. Money in, money out, paid same night.
      </Callout>
    </section>
  );
}
