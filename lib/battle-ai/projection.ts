import { calculate, Move, Pokemon } from "@smogon/calc";
import { classifyMove } from "./classifyMove";
import type { PokemonState } from "./state";

const GEN = 9;

/** Build an @smogon/calc Pokemon from engine state, including current HP. */
export const toCalcPokemon = (p: PokemonState): Pokemon => {
  const mon = new Pokemon(GEN, p.species, {
    level: p.level,
    item: p.item || undefined,
    ability: p.ability || undefined,
    nature: p.nature || undefined,
    evs: p.evs,
    ivs: p.ivs,
    boosts: p.boosts,
    status: (p.status || "") as Pokemon["status"],
  });
  mon.originalCurHP = Math.max(0, Math.round(mon.maxHP() * p.hpFraction));
  return mon;
};

export type DamageEstimate = {
  moveName: string;
  /** Best roll for the attacker, in absolute HP. */
  max: number;
  /** Worst roll for the attacker, in absolute HP. */
  min: number;
};

/**
 * Damage range one move deals from attacker to defender in the current state
 * (boosts, status, items, abilities all accounted for by @smogon/calc).
 * Returns null for non-damaging moves or anything the calc can't model.
 */
export const estimateDamage = (
  attacker: PokemonState,
  defender: PokemonState,
  moveName: string
): DamageEstimate | null => {
  const classified = classifyMove(moveName);
  if (!classified || !classified.categories.includes("damaging")) return null;
  try {
    const result = calculate(
      GEN,
      toCalcPokemon(attacker),
      toCalcPokemon(defender),
      new Move(GEN, moveName)
    );
    const [min, max] = result.range();
    return { moveName, min, max };
  } catch {
    // Exotic mechanics the calc rejects — treat as unprojectable, not fatal.
    return null;
  }
};

export type IncomingProjection = {
  /** The foe's strongest available move, or null if it has no damaging moves. */
  moveName: string | null;
  /** Best-case (for the foe) damage in absolute HP. */
  maxDamage: number;
  defenderCurHP: number;
  defenderMaxHP: number;
  /** maxDamage as a fraction of the defender's max HP. */
  fractionOfMax: number;
  /** True if the foe's best roll KOs the defender from its current HP. */
  wouldKO: boolean;
};

/**
 * Worst case for us next turn: the opponent's best-case damage output against
 * our active Pokémon, i.e. the max roll of their strongest available move.
 * Setup and healing decisions get checked against this number.
 */
export const projectWorstCaseIncoming = (
  foe: PokemonState,
  self: PokemonState
): IncomingProjection => {
  const defender = toCalcPokemon(self);
  const defenderCurHP = defender.curHP();
  const defenderMaxHP = defender.maxHP();

  let best: DamageEstimate | null = null;
  for (const moveName of foe.moves) {
    const estimate = estimateDamage(foe, self, moveName);
    if (estimate && (!best || estimate.max > best.max)) best = estimate;
  }

  const maxDamage = best?.max ?? 0;
  return {
    moveName: best?.moveName ?? null,
    maxDamage,
    defenderCurHP,
    defenderMaxHP,
    fractionOfMax: defenderMaxHP > 0 ? maxDamage / defenderMaxHP : 0,
    wouldKO: maxDamage >= defenderCurHP && defenderCurHP > 0,
  };
};
