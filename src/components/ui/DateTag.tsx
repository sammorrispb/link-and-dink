/** Small stacked month/day chip used in the Past + Upcoming event lists. */
export function DateTag({ month, day }: { month: string; day: string }) {
  return (
    <div className="w-11 rounded-[8px] border border-border-subtle bg-surface-2 px-1 py-1.5 text-center">
      <div className="text-[9px] font-extrabold uppercase tracking-wide text-text-dim">{month}</div>
      <div className="text-[16px] font-black text-text">{day}</div>
    </div>
  );
}
