import { SectionHeader } from "@/components/ui/SectionHeader";

const TILES = [
  { icon: "🧾", line1: "Pure player pot.", line2: "No rake, no fees." },
  { icon: "🎯", line1: "Eval-gated.", line2: "Level-matched." },
  { icon: "✓", line1: "Coach Up", line2: "verified host" },
  { icon: "⚡", line1: "Same-night", line2: "Venmo payout" },
];

export function TrustGrid() {
  return (
    <section>
      <SectionHeader eyebrow="Why this is legit" title="Built for trust, not surprise." />
      <div className="grid grid-cols-2 gap-2">
        {TILES.map((tile) => (
          <div
            key={tile.line1}
            className="flex items-center gap-2.5 rounded-[12px] border border-border-subtle bg-surface-2 px-3 py-2.5"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[rgba(181,214,84,0.14)] text-[13px] font-extrabold text-lime">
              {tile.icon}
            </div>
            <div className="text-[11px] font-bold leading-[1.25] text-text">
              {tile.line1}
              <br />
              {tile.line2}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
