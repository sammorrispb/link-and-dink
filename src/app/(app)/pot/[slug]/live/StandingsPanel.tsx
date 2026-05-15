"use client";

import type { Standing } from "@/lib/tournament";

export function StandingsPanel({
  standings,
  playerNameById,
  isFinal,
}: {
  standings: Standing[];
  playerNameById: Map<string, string>;
  isFinal: boolean;
}) {
  if (standings.length === 0) return null;
  return (
    <div className="rounded-card border border-border-subtle bg-surface-2/40 p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-[11px] uppercase tracking-[2px] text-lime">Standings</div>
        <div className="text-[10px] uppercase tracking-wider text-text-dim">
          {isFinal ? "Final" : "Live"}
        </div>
      </div>
      <ol className="space-y-1">
        {standings.map((s) => (
          <li
            key={s.id}
            className="grid grid-cols-[24px_1fr_auto_auto_auto] items-center gap-2 rounded-md px-1 py-1 text-[13px]"
          >
            <span
              className={`text-center font-extrabold ${
                s.seed === 1 ? "text-lime" : "text-text-muted"
              }`}
            >
              {s.seed}
            </span>
            <span className="truncate text-text">{playerNameById.get(s.id) ?? "—"}</span>
            <span className="text-[12px] tabular-nums text-text-muted">
              {s.wins}–{s.losses}
            </span>
            <span
              className={`w-10 text-right text-[12px] tabular-nums ${
                s.diff > 0 ? "text-lime" : s.diff < 0 ? "text-text-dim" : "text-text-muted"
              }`}
            >
              {s.diff > 0 ? "+" : ""}
              {s.diff}
            </span>
            <span className="w-10 text-right text-[11px] tabular-nums text-text-dim">
              {s.pointsFor}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-2 grid grid-cols-[24px_1fr_auto_auto_auto] gap-2 px-1 text-[9px] uppercase tracking-wider text-text-dim">
        <span />
        <span />
        <span>W–L</span>
        <span className="text-right">Diff</span>
        <span className="text-right">PF</span>
      </div>
    </div>
  );
}
