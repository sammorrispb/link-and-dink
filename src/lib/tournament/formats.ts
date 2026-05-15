import { generatePoolPlayoff } from "./pool-playoff";
import { generateRoundRobin } from "./round-robin";
import { computeSPStandings, generateSamePartner } from "./same-partner";
import { RP_SCHEDULES, SP_SCHEDULES } from "./schedules";
import { computePoolStandings, computeRRStandings } from "./standings";
import type {
  FormatCode,
  FormatModule,
  GenerateOptions,
  GenerateResult,
  Player,
  Standing,
  TournamentEvent,
} from "./types";

function rpModule(
  code: FormatCode,
  playerCount: number,
  bracket: FormatModule["bracket"],
  usesPools: boolean,
): FormatModule {
  const sched = RP_SCHEDULES[code];
  const courts = sched?.courts ?? 0;
  const rrRounds = sched?.rrRounds ?? 0;
  return {
    code,
    variant: "rp",
    name: `Rotating Partner · ${playerCount}p`,
    description: `Individual scoring, partners reshuffle every round. ${courts} ${
      courts === 1 ? "court" : "courts"
    } · ${rrRounds} RR rounds · bracket ${bracket}.`,
    playerCount,
    courts,
    rrRounds,
    bracket,
    validCounts: [playerCount],
    generate: (players: Player[], opts: GenerateOptions = {}): GenerateResult =>
      usesPools
        ? generatePoolPlayoff(players, { courts, ...opts })
        : generateRoundRobin(players, { courts, ...opts }),
    standings: (event: TournamentEvent): Standing[] =>
      usesPools ? computePoolStandings(event) : computeRRStandings(event),
  };
}

function spModule(
  code: FormatCode,
  playerCount: number,
  bracket: FormatModule["bracket"],
): FormatModule {
  const sched = SP_SCHEDULES[code];
  const courts = sched?.courts ?? 0;
  const rrRounds = sched?.rrRounds ?? 0;
  return {
    code,
    variant: "sp",
    name: `Same Partner · ${playerCount}p (${playerCount / 2} teams)`,
    description: `Fixed doubles teams, team scoring. ${courts} ${
      courts === 1 ? "court" : "courts"
    } · ${rrRounds} RR rounds · bracket ${bracket}.`,
    playerCount,
    courts,
    rrRounds,
    bracket,
    validCounts: [playerCount],
    generate: (players: Player[], opts: GenerateOptions = {}): GenerateResult =>
      generateSamePartner(players, opts),
    standings: (event: TournamentEvent): Standing[] => computeSPStandings(event),
  };
}

export const FORMATS: Record<FormatCode, FormatModule> = {
  rp_04: rpModule("rp_04", 4, "championship", false),
  rp_05: rpModule("rp_05", 5, "championship", false),
  rp_06: rpModule("rp_06", 6, "championship", false),
  rp_07: rpModule("rp_07", 7, "championship", false),
  rp_08: rpModule("rp_08", 8, "top4_se", false),
  rp_09: rpModule("rp_09", 9, "top4_se", false),
  rp_10: rpModule("rp_10", 10, "top4_se", true),
  rp_11: rpModule("rp_11", 11, "top4_se", true),
  rp_12: rpModule("rp_12", 12, "top8_se", true),
  rp_13: rpModule("rp_13", 13, "top8_se", true),
  rp_14: rpModule("rp_14", 14, "top8_se", true),
  rp_15: rpModule("rp_15", 15, "top8_se", true),
  rp_16: rpModule("rp_16", 16, "top8_se", true),
  rp_17: rpModule("rp_17", 17, "top8_se", true),
  rp_18: rpModule("rp_18", 18, "top8_se", true),
  sp_06: spModule("sp_06", 6, "championship_top2"),
  sp_08: spModule("sp_08", 8, "top4_se"),
  sp_10: spModule("sp_10", 10, "top4_se"),
  sp_12: spModule("sp_12", 12, "top4_se"),
  sp_14: spModule("sp_14", 14, "top4_se"),
  sp_16: spModule("sp_16", 16, "top4_se"),
  sp_18: spModule("sp_18", 18, "top4_se"),
};

export function formatForPlayerCount(n: number): FormatCode | null {
  const code = `rp_${String(n).padStart(2, "0")}` as FormatCode;
  return code in FORMATS ? code : null;
}
