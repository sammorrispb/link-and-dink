"use client";

import { useState } from "react";
import type { PairingRule, PlayerId, Standing } from "@/lib/tournament";

interface PartnerPickPanelProps {
  seeding: Standing[];
  defaultPairing: PlayerId[][];
  playerNameById: Map<string, string>;
  defaultRule: PairingRule;
  onSave: (rule: PairingRule, teams: PlayerId[][]) => void;
  disabled: boolean;
}

export function PartnerPickPanel({
  seeding,
  defaultPairing,
  playerNameById,
  defaultRule,
  onSave,
  disabled,
}: PartnerPickPanelProps) {
  const [pairing, setPairing] = useState<PlayerId[][]>(() =>
    defaultPairing.map((team) => [...team]),
  );
  const [rule, setRule] = useState<PairingRule>(defaultRule);
  const [selected, setSelected] = useState<PlayerId | null>(null);

  const seedOf = (id: PlayerId) => seeding.find((s) => s.id === id)?.seed ?? "?";
  const nameOf = (id: PlayerId) => playerNameById.get(id) ?? "?";

  const isTop4 = pairing.length === 2;
  const totalQualifiers = isTop4 ? 4 : 8;

  const swap = (a: PlayerId, b: PlayerId) => {
    setPairing((current) => {
      const out = current.map((team) => [...team]);
      for (let ti = 0; ti < out.length; ti++) {
        for (let pi = 0; pi < out[ti].length; pi++) {
          if (out[ti][pi] === a) out[ti][pi] = b;
          else if (out[ti][pi] === b) out[ti][pi] = a;
        }
      }
      return out;
    });
  };

  const onTap = (id: PlayerId) => {
    if (selected == null) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    swap(selected, id);
    setSelected(null);
  };

  const reset = () => {
    setPairing(defaultPairing.map((team) => [...team]));
    setSelected(null);
  };

  const slotLabels = isTop4
    ? ["Championship — Team A", "Championship — Team B"]
    : [
        "Semi 1 — Team A (Court 1)",
        "Semi 1 — Team B (Court 1)",
        "Semi 2 — Team A (Court 2)",
        "Semi 2 — Team B (Court 2)",
      ];

  return (
    <div className="rounded-card border border-lime/30 bg-[linear-gradient(180deg,rgba(181,214,84,0.10),transparent)] p-4">
      <div className="mb-1 text-[11px] uppercase tracking-[2px] text-lime">
        Pick Playoff Partners
      </div>
      <p className="mb-3 text-[13px] text-text-muted">
        Top {totalQualifiers} qualified. Default is <span className="text-text">top-down</span> —
        tap any two players to swap them.
      </p>

      {selected ? (
        <div className="mb-3 rounded-md bg-[rgba(181,214,84,0.10)] px-3 py-2 text-[12px] text-text-muted">
          Selected: <span className="text-text">{nameOf(selected)}</span> (Seed {seedOf(selected)}).
          Tap another player to swap.
        </div>
      ) : (
        <div className="mb-3 text-[12px] text-text-dim">Tap a player to begin swapping.</div>
      )}

      <div className="space-y-3">
        {pairing.map((team, ti) => {
          const slotKey = `pick-slot-${ti}`;
          return (
            <div
              key={slotKey}
              className="rounded-card border border-border-subtle bg-surface-2 p-3"
            >
              <div className="mb-2 text-[10px] uppercase tracking-wider text-text-dim">
                {slotLabels[ti]}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {team.map((pid) => (
                  <button
                    type="button"
                    key={pid}
                    onClick={() => onTap(pid)}
                    className={`rounded-card border px-3 py-3 text-left transition-transform active:scale-[0.98] ${
                      selected === pid
                        ? "border-lime bg-lime/10"
                        : "border-border-subtle bg-[rgba(255,253,250,0.03)] hover:border-border-medium"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-text-dim">
                      Seed {seedOf(pid)}
                    </div>
                    <div className="text-[15px] font-extrabold text-text">{nameOf(pid)}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-[12px] text-text-muted">
          <input
            type="checkbox"
            checked={rule === "snake"}
            onChange={(e) => setRule(e.target.checked ? "snake" : "top_down")}
            className="h-4 w-4 accent-lime"
          />
          Use snake pairing (balances teams)
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={disabled}
            className="flex-1 rounded-btn border border-border-subtle bg-transparent px-3 py-2 text-[12px] font-semibold text-text-muted hover:bg-[rgba(255,253,250,0.04)] disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSave(rule, pairing)}
            className="flex-[2] rounded-btn bg-lime px-3 py-2 text-[13px] font-extrabold text-action-text hover:bg-lime-hover disabled:opacity-50"
          >
            Lock Bracket
          </button>
        </div>
      </div>
    </div>
  );
}
