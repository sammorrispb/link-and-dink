import { rankStats, tallyMatches } from "./standings";
import type { Match, PairingRule, PlayerId, Round, Standing, TournamentEvent } from "./types";

function rrMatchesOnly(event: TournamentEvent): Match[] {
  return event.rounds.flatMap((r) => r.matches).filter((m) => !m.isPlayoff);
}

export function computeOverallSeeding(event: TournamentEvent): Standing[] {
  const playerIds = event.players.map((p) => p.id);
  const matches = rrMatchesOnly(event);
  const stats = tallyMatches(matches, playerIds);
  return rankStats(Object.values(stats), matches);
}

export function playoffQualifierCount(event: TournamentEvent): 4 | 8 {
  return event.players.length <= 10 ? 4 : 8;
}

export function defaultPlayoffPairing(
  event: TournamentEvent,
  rule: PairingRule = "top_down",
): PlayerId[][] | null {
  const ranked = computeOverallSeeding(event);
  const qCount = playoffQualifierCount(event);
  const top = ranked.slice(0, qCount);
  if (top.length < qCount) return null;

  if (qCount === 4) {
    if (rule === "snake") {
      return [
        [top[0].id, top[3].id],
        [top[1].id, top[2].id],
      ];
    }
    return [
      [top[0].id, top[1].id],
      [top[2].id, top[3].id],
    ];
  }

  if (rule === "snake") {
    return [
      [top[0].id, top[7].id],
      [top[3].id, top[4].id],
      [top[1].id, top[6].id],
      [top[2].id, top[5].id],
    ];
  }
  return [
    [top[0].id, top[1].id],
    [top[6].id, top[7].id],
    [top[2].id, top[3].id],
    [top[4].id, top[5].id],
  ];
}

export function buildPlayoffSemis(
  event: TournamentEvent,
  customPairing: PlayerId[][] | null = null,
  rule: PairingRule = "top_down",
): Round | null {
  const pairing = customPairing ?? defaultPlayoffPairing(event, rule);
  if (!pairing) return null;
  const qCount = pairing.length === 2 ? 4 : 8;
  const roundNum = event.rounds.length + 1;

  if (qCount === 4) {
    return {
      number: roundNum,
      label: "Championship",
      isPlayoff: true,
      matches: [
        {
          id: "po-final",
          round: roundNum,
          court: 1,
          stage: "championship",
          isPlayoff: true,
          playoffSlot: "final",
          teamA: pairing[0],
          teamB: pairing[1],
          scoreA: null,
          scoreB: null,
          complete: false,
        },
      ],
    };
  }

  return {
    number: roundNum,
    label: "Semifinals",
    isPlayoff: true,
    matches: [
      {
        id: "po-sf1",
        round: roundNum,
        court: 1,
        stage: "semifinal",
        isPlayoff: true,
        playoffSlot: "sf1",
        teamA: pairing[0],
        teamB: pairing[1],
        scoreA: null,
        scoreB: null,
        complete: false,
      },
      {
        id: "po-sf2",
        round: roundNum,
        court: 2,
        stage: "semifinal",
        isPlayoff: true,
        playoffSlot: "sf2",
        teamA: pairing[2],
        teamB: pairing[3],
        scoreA: null,
        scoreB: null,
        complete: false,
      },
    ],
  };
}

export function buildPlayoffFinalIfReady(event: TournamentEvent): Round | null {
  const sfRound = event.rounds.find((r) => r.label === "Semifinals");
  if (!sfRound) return null;
  const sf1 = sfRound.matches.find((m) => m.playoffSlot === "sf1");
  const sf2 = sfRound.matches.find((m) => m.playoffSlot === "sf2");
  if (!sf1 || !sf2) return null;
  if (!sf1.complete || !sf2.complete) return null;
  if (event.rounds.some((r) => r.label === "Final")) return null;
  const winnerOf = (m: Match): PlayerId[] =>
    Number(m.scoreA) > Number(m.scoreB) ? m.teamA : m.teamB;
  const roundNum = event.rounds.length + 1;
  return {
    number: roundNum,
    label: "Final",
    isPlayoff: true,
    matches: [
      {
        id: "po-final",
        round: roundNum,
        court: 1,
        stage: "final",
        isPlayoff: true,
        playoffSlot: "final",
        teamA: winnerOf(sf1),
        teamB: winnerOf(sf2),
        scoreA: null,
        scoreB: null,
        complete: false,
      },
    ],
  };
}
