/**
 * The Entry / Pot two-tile row. Used on the featured event card (discovery)
 * and again on the pre-event confirmation screen. The Pot tile is wider
 * (flex 1.6) and uses the lime accent; the Entry tile is the neutral surface.
 */
export function EntryPotTiles({
  entryLabel,
  entryValue,
  entrySuffix,
  potLabel,
  potValue,
  potSuffix,
  valueClassName = "text-[22px]",
}: {
  entryLabel: string;
  entryValue: string;
  entrySuffix?: string;
  potLabel: string;
  potValue: string;
  potSuffix?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 rounded-[12px] border border-border-subtle bg-surface-2 px-3.5 py-2.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">
          {entryLabel}
        </div>
        <div className={`mt-1 font-black tracking-[-0.02em] text-text ${valueClassName}`}>
          {entryValue}
          {entrySuffix ? (
            <span className="text-[11px] font-bold text-text-dim"> {entrySuffix}</span>
          ) : null}
        </div>
      </div>

      <div className="flex-[1.6] rounded-[12px] border border-border-medium bg-[linear-gradient(160deg,#07332a_0%,#044026_100%)] px-3.5 py-2.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-lime">
          {potLabel}
        </div>
        <div className={`mt-1 font-black tracking-[-0.02em] text-lime ${valueClassName}`}>
          {potValue}
          {potSuffix ? (
            <span className="text-[11px] font-bold text-text-dim"> {potSuffix}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
