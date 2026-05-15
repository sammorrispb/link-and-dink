"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PlayoffPairingRow, TeamRow } from "@/lib/supabase/types";
import {
  computeOverallSeeding,
  defaultPlayoffPairing,
  type Match as EngineMatch,
  FORMATS,
  type FormatCode,
  type PlayerId,
  type TournamentEvent,
} from "@/lib/tournament";
import { groupIntoRounds } from "@/lib/tournament-live-shared";
import {
  generateFinalAction,
  lockMatchAction,
  savePlayoffPairingAction,
  savePreEventTeamsAction,
  saveScoreAction,
  startTournamentAction,
  unlockMatchAction,
} from "./actions";
import { MatchCard } from "./MatchCard";
import { PartnerPickPanel } from "./PartnerPickPanel";
import { StandingsPanel } from "./StandingsPanel";
import { TeamPickerPanel } from "./TeamPickerPanel";

interface RosterEntry {
  playerId: string;
  displayName: string;
  rsvpStatus: string;
}

interface LiveClientProps {
  slug: string;
  initialTournament: TournamentEvent;
  initialTeams: TeamRow[];
  initialPairing: PlayoffPairingRow | null;
  roster: RosterEntry[];
  format: string;
  eventTitle: string;
}

const SCORE_DEBOUNCE_MS = 500;

export function LiveClient({
  slug,
  initialTournament,
  initialTeams,
  initialPairing,
  roster,
  format,
  eventTitle,
}: LiveClientProps) {
  // Authoritative client state — seeded from server, mutated locally,
  // resynced on every revalidatePath().
  const [matches, setMatches] = useState<EngineMatch[]>(
    initialTournament.rounds.flatMap((r) => r.matches),
  );
  const [pairing, setPairing] = useState<PlayoffPairingRow | null>(initialPairing);
  const [teams, setTeams] = useState<TeamRow[]>(initialTeams);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMatches(initialTournament.rounds.flatMap((r) => r.matches));
    setPairing(initialPairing);
    setTeams(initialTeams);
  }, [initialTournament, initialPairing, initialTeams]);

  // Re-derive a TournamentEvent shape from current matches so the engine's
  // standings function stays the single source of truth.
  const tournament: TournamentEvent = useMemo(
    () => ({
      players: initialTournament.players,
      rounds: groupIntoRounds(matches),
      format: format as FormatCode,
      hasPlayoffs: initialTournament.hasPlayoffs,
    }),
    [matches, initialTournament.players, initialTournament.hasPlayoffs, format],
  );

  const playerNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of initialTournament.players) m.set(p.id, p.name ?? "—");
    for (const r of roster) m.set(r.playerId, r.displayName);
    return m;
  }, [initialTournament.players, roster]);

  const formatMod = FORMATS[format as FormatCode];
  const standings = useMemo(
    () => (formatMod ? formatMod.standings(tournament) : []),
    [formatMod, tournament],
  );

  // ── derived state machine ────────────────────────────────────────────────
  const rrMatches = matches.filter((m) => !m.isPlayoff);
  const playoffMatches = matches.filter((m) => m.isPlayoff);
  const rrDone = rrMatches.length > 0 && rrMatches.every((m) => m.complete);
  const semis = playoffMatches.filter((m) => m.stage === "semifinal" || m.stage === "championship");
  const semisLocked = semis.length > 0 && semis.every((m) => m.complete);
  const finalExists = playoffMatches.some((m) => m.stage === "final");
  const allLocked = matches.length > 0 && matches.every((m) => m.complete);
  const playoffsExist = playoffMatches.length > 0;

  // ── action wrappers ──────────────────────────────────────────────────────
  const run = (fn: () => Promise<void>) => {
    setError(null);
    startTransition(() => {
      fn().catch((err) => setError(err instanceof Error ? err.message : String(err)));
    });
  };

  // Debounced score saver, keyed by match id.
  const pendingSaveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const queueScoreSave = (matchId: string, scoreA: number | null, scoreB: number | null) => {
    const timers = pendingSaveTimers.current;
    const existing = timers.get(matchId);
    if (existing) clearTimeout(existing);
    timers.set(
      matchId,
      setTimeout(() => {
        saveScoreAction(slug, matchId, scoreA, scoreB).catch((err) =>
          setError(err instanceof Error ? err.message : String(err)),
        );
        timers.delete(matchId);
      }, SCORE_DEBOUNCE_MS),
    );
  };

  const handleScoreChange = (matchId: string, scoreA: number | null, scoreB: number | null) => {
    setMatches((current) => current.map((m) => (m.id === matchId ? { ...m, scoreA, scoreB } : m)));
    queueScoreSave(matchId, scoreA, scoreB);
  };

  const handleLock = (matchId: string) => {
    // Optimistic locked state — the server response replaces this on revalidate.
    setMatches((current) => current.map((m) => (m.id === matchId ? { ...m, complete: true } : m)));
    run(() => lockMatchAction(slug, matchId));
  };

  const handleUnlock = (matchId: string) => {
    setMatches((current) => current.map((m) => (m.id === matchId ? { ...m, complete: false } : m)));
    run(() => unlockMatchAction(slug, matchId));
  };

  // ── empty state branches ─────────────────────────────────────────────────
  if (matches.length === 0) {
    const needsTeams =
      formatMod?.variant === "sp" && teams.length < (formatMod?.playerCount ?? 0) / 2;

    if (needsTeams) {
      return (
        <Shell title={eventTitle} subtitle={formatMod?.name ?? format} error={error}>
          <TeamPickerPanel
            roster={roster}
            initialTeams={teams.map((t) => ({
              player1Id: t.player1_id,
              player2Id: t.player2_id,
              label: t.label ?? undefined,
            }))}
            expectedTeams={(formatMod?.playerCount ?? 0) / 2}
            onSave={(pairs) => run(() => savePreEventTeamsAction(slug, pairs))}
            disabled={isPending}
          />
        </Shell>
      );
    }

    return (
      <Shell title={eventTitle} subtitle={formatMod?.name ?? format} error={error}>
        <StartCard
          roster={roster}
          formatLabel={formatMod?.name ?? format}
          playerCount={formatMod?.playerCount ?? roster.length}
          teamsReady={formatMod?.variant === "sp" ? teams.length : null}
          disabled={isPending}
          onStart={() => run(() => startTournamentAction(slug))}
        />
      </Shell>
    );
  }

  // ── tournament in progress ───────────────────────────────────────────────
  const rounds = tournament.rounds;
  const seeding = rrDone && !playoffsExist ? computeOverallSeeding(tournament) : [];
  const pickerDefault =
    rrDone && !playoffsExist
      ? (defaultPlayoffPairing(tournament, "top_down") as PlayerId[][] | null)
      : null;

  return (
    <Shell title={eventTitle} subtitle={formatMod?.name ?? format} error={error}>
      <div className="space-y-4">
        {rounds.map((round) => (
          <section key={round.number} className="space-y-2">
            <header className="flex items-baseline gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-card text-[14px] font-extrabold ${
                  round.isPlayoff ? "bg-lime/15 text-lime" : "bg-surface-2 text-text"
                }`}
              >
                {round.isPlayoff ? (round.label === "Final" ? "F" : "SF") : round.number}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[2px] text-text-dim">
                  {round.isPlayoff ? round.label : `Round ${round.number}`}
                </span>
                <span className="text-[11px] text-text-dim">
                  {round.matches.filter((m) => m.complete).length}/{round.matches.length} locked
                </span>
              </div>
            </header>
            <div className="space-y-2">
              {round.matches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  playerNameById={playerNameById}
                  onScoreChange={(a, b) => handleScoreChange(m.id, a, b)}
                  onLock={() => handleLock(m.id)}
                  onUnlock={() => handleUnlock(m.id)}
                  disabled={isPending}
                />
              ))}
            </div>
          </section>
        ))}

        <StandingsPanel standings={standings} playerNameById={playerNameById} isFinal={allLocked} />

        {rrDone && !playoffsExist && pickerDefault ? (
          <PartnerPickPanel
            seeding={seeding}
            defaultPairing={pickerDefault}
            playerNameById={playerNameById}
            defaultRule="top_down"
            onSave={(rule, teamsPick) => run(() => savePlayoffPairingAction(slug, rule, teamsPick))}
            disabled={isPending}
          />
        ) : null}

        {pairing && semisLocked && !finalExists ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => generateFinalAction(slug))}
            className="w-full rounded-btn bg-lime px-4 py-3 text-[14px] font-extrabold text-action-text hover:bg-lime-hover disabled:opacity-50"
          >
            Generate Final →
          </button>
        ) : null}

        {allLocked ? (
          <div className="rounded-card border border-lime/30 bg-lime/10 p-4 text-center text-[13px] text-lime">
            Final results locked. Champion: seed 1 ·{" "}
            {playerNameById.get(standings[0]?.id ?? "") ?? "—"}.
          </div>
        ) : null}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function Shell({
  title,
  subtitle,
  error,
  children,
}: {
  title: string;
  subtitle: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 px-4 pb-10 pt-3">
      <header className="mb-4">
        <h1 className="text-[22px] font-extrabold text-text">{title}</h1>
        <p className="text-[12px] uppercase tracking-[2px] text-text-dim">Live · {subtitle}</p>
      </header>
      {error ? (
        <div
          role="alert"
          className="mb-3 rounded-card border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger"
        >
          {error}
        </div>
      ) : null}
      {children}
    </main>
  );
}

function StartCard({
  roster,
  formatLabel,
  playerCount,
  teamsReady,
  disabled,
  onStart,
}: {
  roster: RosterEntry[];
  formatLabel: string;
  playerCount: number;
  teamsReady: number | null;
  disabled: boolean;
  onStart: () => void;
}) {
  const confirmed = roster.filter((r) => r.rsvpStatus === "confirmed");
  const canStart = confirmed.length >= playerCount;
  return (
    <div className="rounded-card border border-border-medium bg-surface-2 p-4">
      <div className="mb-1 text-[11px] uppercase tracking-[2px] text-lime">Tournament setup</div>
      <p className="mb-3 text-[14px] text-text-muted">
        {formatLabel} · need {playerCount} confirmed players. Currently{" "}
        <span className="text-text">{confirmed.length}</span> on the roster.
        {teamsReady != null ? ` Teams locked: ${teamsReady}/${playerCount / 2}.` : ""}
      </p>
      <ol className="mb-4 space-y-1 text-[13px]">
        {roster.slice(0, playerCount).map((r, i) => (
          <li key={r.playerId} className="flex items-center gap-2">
            <span className="w-4 text-right text-text-dim">{i + 1}</span>
            <span className="text-text">{r.displayName}</span>
          </li>
        ))}
        {roster.length > playerCount ? (
          <li className="text-[12px] italic text-text-dim">
            +{roster.length - playerCount} on waitlist
          </li>
        ) : null}
      </ol>
      <button
        type="button"
        onClick={onStart}
        disabled={disabled || !canStart}
        className="w-full rounded-btn bg-lime px-4 py-3 text-[14px] font-extrabold text-action-text hover:bg-lime-hover disabled:opacity-50"
      >
        Start Tournament
      </button>
    </div>
  );
}
