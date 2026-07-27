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

// @smogon/calc computes damage from base power and stats — it has no model
// for moves whose damage is derived from current HP rather than the attack
// formula. Endeavor either throws or returns 0 depending on the HP values
// involved; Super Fang and Ruination (identical "half the target's current
// HP" effect) silently return 0. Left unhandled, these look like worthless
// 0-power moves and the scorer will never choose them, defeating strategies
// that depend on them (e.g. Focus Sash into Endeavor into a priority move).
// Computed directly from real current HP instead of routed through the calc.
const FRACTION_OF_TARGET_HP_MOVES = new Set(["superfang", "ruination"]);

const isSpecialCaseMove = (moveId: string): boolean =>
  moveId === "endeavor" || FRACTION_OF_TARGET_HP_MOVES.has(moveId);

const computeSpecialCaseDamage = (
  moveId: string,
  attacker: Pokemon,
  defender: Pokemon
): { min: number; max: number } | null => {
  if (!isSpecialCaseMove(moveId)) return null;

  const defenderCurHP = defender.curHP();
  if (defenderCurHP <= 0) return { min: 0, max: 0 };

  if (moveId === "endeavor") {
    const attackerCurHP = attacker.curHP();
    // Endeavor fails outright (deals no damage) unless the user's current HP
    // is strictly less than the target's.
    const dmg = attackerCurHP < defenderCurHP ? defenderCurHP - attackerCurHP : 0;
    return { min: dmg, max: dmg };
  }

  // Super Fang / Ruination: half the target's current HP, minimum 1.
  const dmg = Math.max(1, Math.floor(defenderCurHP / 2));
  return { min: dmg, max: dmg };
};

/**
 * Damage range one move deals from attacker to defender in the current state
 * (boosts, status, items, abilities all accounted for by @smogon/calc, except
 * for the current-HP-relative moves handled directly above).
 * Returns null for non-damaging moves or anything the calc can't model.
 */
export const estimateDamage = (
  attacker: PokemonState,
  defender: PokemonState,
  moveName: string
): DamageEstimate | null => {
  const classified = classifyMove(moveName);
  if (!classified || !classified.categories.includes("damaging")) return null;

  const attackerCalc = toCalcPokemon(attacker);
  const defenderCalc = toCalcPokemon(defender);

  const special = computeSpecialCaseDamage(classified.id, attackerCalc, defenderCalc);
  if (special) return { moveName, ...special };

  try {
    const result = calculate(GEN, attackerCalc, defenderCalc, new Move(GEN, moveName));
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
