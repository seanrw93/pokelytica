import type { TypeName } from "@pkmn/data";
import { classifyMove } from "./classifyMove";
import { gen9 } from "./dex";
import { effectiveSpeed } from "./scoreActions";
import type { PokemonState } from "./state";

/** Combined effectiveness of one attacking type against a defender's types. */
export const typeEffectiveness = (attackingType: string, defenderTypes: readonly string[]): number =>
  gen9.types.totalEffectiveness(attackingType as TypeName, defenderTypes as TypeName[]);

const typesOf = (p: PokemonState): readonly string[] =>
  gen9.species.get(p.species)?.types ?? [];

/** Types this Pokémon can actually attack with (falls back to its own types). */
const attackingTypes = (p: PokemonState): string[] => {
  const fromMoves = p.moves
    .filter((name) => classifyMove(name)?.categories.includes("damaging"))
    .map((name) => gen9.moves.get(name)?.type)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  return fromMoves.length > 0 ? [...new Set(fromMoves)] : [...typesOf(p)];
};

// Effectiveness multiplier → matchup value, shared by both directions.
const effValue = (mult: number): number => {
  if (mult >= 4) return 1;
  if (mult >= 2) return 0.5;
  if (mult >= 1) return 0;
  if (mult >= 0.5) return -0.35;
  if (mult > 0) return -0.6;
  return -0.8;
};

const SPEED_BONUS = 0.25;

export type SwitchEvaluation = {
  species: string;
  /** Index into the bench array this evaluation refers to. */
  benchIndex: number;
  score: number;
  why: string;
};

/**
 * Score one candidate's matchup against the foe's active: do I threaten them,
 * do they threaten me, and who moves first.
 */
export const evaluateMatchup = (candidate: PokemonState, foe: PokemonState): number => {
  const offense = Math.max(
    ...attackingTypes(candidate).map((t) => typeEffectiveness(t, typesOf(foe))),
    0
  );
  const incoming = Math.max(
    ...attackingTypes(foe).map((t) => typeEffectiveness(t, typesOf(candidate))),
    0
  );
  const faster = effectiveSpeed(candidate) > effectiveSpeed(foe);
  return effValue(offense) - effValue(incoming) + (faster ? SPEED_BONUS : 0);
};

/**
 * Rank every healthy bench Pokémon against the foe's active, best first.
 * Used both for forced switches (after a faint) and proactive ones (the
 * caller decides whether the best option clears its "clearly better" bar).
 */
export const evaluateSwitches = (
  bench: PokemonState[],
  foeActive: PokemonState
): SwitchEvaluation[] =>
  bench
    .map((candidate, benchIndex) => ({
      species: candidate.species,
      benchIndex,
      score: evaluateMatchup(candidate, foeActive),
      why: `matchup vs ${foeActive.species}`,
    }))
    .sort((a, b) => b.score - a.score);
