"use client";

import { useEffect, useId, useState } from "react";
import type { Match as EngineMatch } from "@/lib/tournament";

interface MatchCardProps {
  match: EngineMatch;
  playerNameById: Map<string, string>;
  onScoreChange: (scoreA: number | null, scoreB: number | null) => void;
  onLock: () => void;
  onUnlock: () => void;
  disabled: boolean;
}

const SCORE_REGEX = /^[0-9]{0,2}$/;

function parseScore(input: string): number | null {
  if (input === "") return null;
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}

export function MatchCard({
  match,
  playerNameById,
  onScoreChange,
  onLock,
  onUnlock,
  disabled,
}: MatchCardProps) {
  const aId = useId();
  const bId = useId();
  const [scoreA, setScoreA] = useState<string>(match.scoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState<string>(match.scoreB?.toString() ?? "");

  // Keep local input state in sync if the server-passed match changes
  // (e.g. after revalidatePath on lock).
  useEffect(() => {
    setScoreA(match.scoreA?.toString() ?? "");
    setScoreB(match.scoreB?.toString() ?? "");
  }, [match.scoreA, match.scoreB]);

  const locked = match.complete;
  const aWin = match.scoreA != null && match.scoreB != null && match.scoreA > match.scoreB;
  const bWin = match.scoreA != null && match.scoreB != null && match.scoreB > match.scoreA;
  const canLock = match.scoreA != null && match.scoreB != null && match.scoreA !== match.scoreB;

  const nameOf = (id: string) => playerNameById.get(id) ?? "—";

  const handleScoreA = (raw: string) => {
    if (!SCORE_REGEX.test(raw)) return;
    setScoreA(raw);
    onScoreChange(parseScore(raw), parseScore(scoreB));
  };
  const handleScoreB = (raw: string) => {
    if (!SCORE_REGEX.test(raw)) return;
    setScoreB(raw);
    onScoreChange(parseScore(scoreA), parseScore(raw));
  };

  return (
    <div
      className={`rounded-card border p-3 ${
        locked ? "border-border-medium bg-surface-2/60" : "border-border-subtle bg-surface-2"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          {match.pool ? (
            <span className="rounded-pill border border-border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-dim">
              Pool {match.pool}
            </span>
          ) : null}
          <span className="text-[10px] uppercase tracking-wider text-text-dim">Court</span>
          <span className="text-[20px] font-extrabold leading-none text-text">{match.court}</span>
        </div>
        <span
          className={`rounded-pill border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
            locked
              ? "border-lime/40 bg-lime/10 text-lime"
              : canLock
                ? "border-yellow/40 bg-yellow/10 text-yellow"
                : "border-border-subtle text-text-dim"
          }`}
        >
          {locked ? "✓ Locked" : canLock ? "Ready" : "Open"}
        </span>
      </div>

      <Row
        names={match.teamA.map(nameOf).join(" · ")}
        score={locked ? (match.scoreA ?? 0).toString() : scoreA}
        inputId={aId}
        onChange={handleScoreA}
        locked={locked}
        winner={aWin}
        loser={bWin}
      />
      <div className="my-1 text-center text-[10px] uppercase tracking-[3px] text-text-dim">vs</div>
      <Row
        names={match.teamB.map(nameOf).join(" · ")}
        score={locked ? (match.scoreB ?? 0).toString() : scoreB}
        inputId={bId}
        onChange={handleScoreB}
        locked={locked}
        winner={bWin}
        loser={aWin}
      />

      <div className="mt-3 flex items-center gap-2">
        {locked ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onUnlock}
            className="ml-auto rounded-btn border border-border-subtle bg-transparent px-3 py-1.5 text-[12px] font-semibold text-text-muted hover:bg-[rgba(255,253,250,0.04)] disabled:opacity-50"
          >
            Edit
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled || !canLock}
            onClick={onLock}
            className="w-full rounded-btn bg-lime px-4 py-2 text-[13px] font-extrabold text-action-text hover:bg-lime-hover disabled:opacity-50"
          >
            Lock Match
          </button>
        )}
      </div>
    </div>
  );
}

function Row({
  names,
  score,
  inputId,
  onChange,
  locked,
  winner,
  loser,
}: {
  names: string;
  score: string;
  inputId: string;
  onChange: (raw: string) => void;
  locked: boolean;
  winner: boolean;
  loser: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-1 text-[14px] font-semibold ${
          winner ? "text-lime" : loser ? "text-text-dim" : "text-text"
        }`}
      >
        {names}
      </div>
      {locked ? (
        <div
          className={`min-w-[56px] rounded-btn border px-3 py-1.5 text-center text-[20px] font-extrabold ${
            winner ? "border-lime/40 bg-lime/10 text-lime" : "border-border-subtle text-text-muted"
          }`}
        >
          {score || "—"}
        </div>
      ) : (
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={score}
          onChange={(e) => onChange(e.target.value)}
          placeholder="–"
          aria-label={`${names} score`}
          className="w-[64px] rounded-btn border border-border-subtle bg-[rgba(255,253,250,0.04)] px-2 py-1.5 text-center text-[20px] font-extrabold text-text focus:border-lime focus:outline-none"
        />
      )}
    </div>
  );
}
