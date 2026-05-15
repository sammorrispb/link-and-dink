"use client";

import { useState } from "react";

interface RosterEntry {
  playerId: string;
  displayName: string;
}

export function TeamPickerPanel({
  roster,
  initialTeams,
  expectedTeams,
  onSave,
  disabled,
}: {
  roster: RosterEntry[];
  initialTeams: Array<{ player1Id: string; player2Id: string; label?: string }>;
  expectedTeams: number;
  onSave: (pairs: Array<{ player1Id: string; player2Id: string; label?: string }>) => void;
  disabled: boolean;
}) {
  const [pairs, setPairs] = useState<string[][]>(() => {
    if (initialTeams.length === expectedTeams) {
      return initialTeams.map((t) => [t.player1Id, t.player2Id]);
    }
    // Default: sequential pairing of the confirmed roster.
    const out: string[][] = [];
    for (let i = 0; i < expectedTeams; i++) {
      const a = roster[i * 2]?.playerId ?? "";
      const b = roster[i * 2 + 1]?.playerId ?? "";
      out.push([a, b]);
    }
    return out;
  });

  const playerName = (id: string) => roster.find((r) => r.playerId === id)?.displayName ?? "—";

  // Which slot is selected for a swap?
  const [selected, setSelected] = useState<{
    teamIdx: number;
    slotIdx: number;
  } | null>(null);

  const tap = (teamIdx: number, slotIdx: number) => {
    if (!selected) {
      setSelected({ teamIdx, slotIdx });
      return;
    }
    if (selected.teamIdx === teamIdx && selected.slotIdx === slotIdx) {
      setSelected(null);
      return;
    }
    setPairs((current) => {
      const out = current.map((t) => [...t]);
      const a = out[selected.teamIdx][selected.slotIdx];
      const b = out[teamIdx][slotIdx];
      out[selected.teamIdx][selected.slotIdx] = b;
      out[teamIdx][slotIdx] = a;
      return out;
    });
    setSelected(null);
  };

  const valid = pairs.every(([a, b]) => a && b && a !== b);

  return (
    <div className="rounded-card border border-border-medium bg-surface-2 p-4">
      <div className="mb-1 text-[11px] uppercase tracking-[2px] text-lime">Team Picker</div>
      <p className="mb-3 text-[13px] text-text-muted">
        Same-Partner format. Pair every player into a fixed team — tap two slots to swap.{" "}
        {expectedTeams} teams of 2 from {roster.length} confirmed players.
      </p>

      <div className="space-y-3">
        {pairs.map((team, ti) => {
          const slotKey = `team-${ti}`;
          return (
            <div
              key={slotKey}
              className="rounded-card border border-border-subtle bg-[rgba(255,253,250,0.02)] p-3"
            >
              <div className="mb-2 text-[10px] uppercase tracking-wider text-text-dim">
                Team {ti + 1}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {team.map((pid, si) => {
                  const isSelected = selected?.teamIdx === ti && selected?.slotIdx === si;
                  const innerKey = `${slotKey}-slot-${si}`;
                  return (
                    <button
                      type="button"
                      key={innerKey}
                      onClick={() => tap(ti, si)}
                      className={`rounded-card border px-3 py-2 text-left text-[14px] font-semibold transition-transform active:scale-[0.98] ${
                        isSelected
                          ? "border-lime bg-lime/10 text-lime"
                          : "border-border-subtle bg-surface-2 text-text hover:border-border-medium"
                      }`}
                    >
                      {playerName(pid)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || !valid}
        onClick={() =>
          onSave(
            pairs.map(([a, b], i) => ({
              player1Id: a,
              player2Id: b,
              label: `Team ${i + 1}`,
            })),
          )
        }
        className="mt-4 w-full rounded-btn bg-lime px-4 py-3 text-[14px] font-extrabold text-action-text hover:bg-lime-hover disabled:opacity-50"
      >
        Save Teams
      </button>
    </div>
  );
}
