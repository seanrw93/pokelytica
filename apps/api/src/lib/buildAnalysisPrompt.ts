import { describeTeam, type PokemonSlot } from "./battleSim";

export type AnalyzeInput = {
  teamA: PokemonSlot[];
  teamB: PokemonSlot[];
  p1WinPct: string;
  p2WinPct: string;
  tiePct: string;
  avgTurns: string;
  topMoves: string;
  faintSummary: string;
  lastLog: string;
};

const NUM_BATTLES = 100;

export const buildAnalysisPrompt = ({
  teamA,
  teamB,
  p1WinPct,
  p2WinPct,
  tiePct,
  avgTurns,
  topMoves,
  faintSummary,
  lastLog,
}: AnalyzeInput) => `You are a Pokémon battle analyst. After running ${NUM_BATTLES} simulated battles between two teams, here are the results:
Team A represents the user (the player) and Team B represents the opponent.

Team A: ${p1WinPct}% win rate
Team B: ${p2WinPct}% win rate
Ties: ${tiePct}%

Average battle length: ${avgTurns} turns
Most used moves across all ${NUM_BATTLES} battles: ${topMoves}

Pokémon faint frequency across all ${NUM_BATTLES} battles:
${faintSummary}

Team A composition:
${describeTeam(teamA)}

Team B composition:
${describeTeam(teamB)}

Here is one representative battle log to help ground your analysis. The log uses Pokémon Showdown protocol:
- |move|POKEMON|MOVE NAME| — a Pokémon used a move
- |damage|POKEMON|HP/MAXHP| — a Pokémon took damage
- |-heal|POKEMON|HP/MAXHP| — a Pokémon was healed
- |faint|POKEMON| — a Pokémon fainted
- |switch|POKEMON|DETAILS|HP| — a Pokémon switched in
- |win|PLAYER| — the winner of the battle

Representative battle log:
${lastLog}

Based on the win statistics, aggregate data, team compositions, and the battle log above, provide:
1. **Win Probability** — summarize the matchup odds
2. **Strengths** — what gives the winning team its edge, referencing specific moments from the log and aggregate data
3. **Weaknesses** — what holds the losing team back, referencing specific moments from the log and aggregate data
4. **Improvement suggestions** — specific move or Pokémon changes to Team A to improve its win rate

Only analyze based on the data provided. Do not invent move effects or stats not mentioned above.`;
