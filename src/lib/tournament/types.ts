export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name?: string;
  seat?: number;
};

export type Team = {
  id: string;
  player1Id: PlayerId;
  player2Id: PlayerId;
  label?: string;
};

export type MatchStage = "rr" | "quarterfinal" | "semifinal" | "final" | "championship";

export type Match = {
  id: string;
  round: number;
  court: number;
  pool?: string;
  stage: MatchStage;
  isPlayoff?: boolean;
  playoffSlot?: "sf1" | "sf2" | "final" | "qf1" | "qf2" | "qf3" | "qf4";
  teamA: PlayerId[];
  teamB: PlayerId[];
  scoreA: number | null;
  scoreB: number | null;
  complete: boolean;
};

export type Round = {
  number: number;
  label: string;
  matches: Match[];
  isPlayoff?: boolean;
};

export type GenerateOptions = {
  courts?: number;
};

export type GenerateResult = {
  rounds: Round[];
  pools?: PlayerId[][];
  hasPlayoffs?: boolean;
};

export type TournamentEvent = {
  players: Player[];
  rounds: Round[];
  pools?: PlayerId[][] | null;
  hasPlayoffs?: boolean;
  format: FormatCode;
};

export type Standing = {
  id: PlayerId;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  played: number;
  diff: number;
  seed: number;
  pool?: string;
};

export type PairingRule = "snake" | "top_down";

export type FormatVariant = "rp" | "sp";

export type FormatCode =
  | "rp_04"
  | "rp_05"
  | "rp_06"
  | "rp_07"
  | "rp_08"
  | "rp_09"
  | "rp_10"
  | "rp_11"
  | "rp_12"
  | "rp_13"
  | "rp_14"
  | "rp_15"
  | "rp_16"
  | "rp_17"
  | "rp_18"
  | "sp_06"
  | "sp_08"
  | "sp_10"
  | "sp_12"
  | "sp_14"
  | "sp_16"
  | "sp_18";

export type FormatModule = {
  code: FormatCode;
  variant: FormatVariant;
  name: string;
  description: string;
  playerCount: number;
  courts: number;
  rrRounds: number;
  bracket: "championship" | "top4_se" | "top8_se" | "championship_top2";
  validCounts: number[];
  generate(players: Player[], opts?: GenerateOptions): GenerateResult;
  standings(event: TournamentEvent): Standing[];
};
