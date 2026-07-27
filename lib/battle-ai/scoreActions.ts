import { classifyMove, type MoveCategory } from "./classifyMove";
import { estimateDamage, projectWorstCaseIncoming, toCalcPokemon, type IncomingProjection } from "./projection";
import type { BattleSnapshot, PokemonState } from "./state";
import { gen9 } from "./dex";

// All actions compete on one scale, denominated roughly in "fractions of a
// Pokémon's HP": a move dealing 50% of the target's current HP scores ~0.5,
// and non-damaging actions are priced in the same currency so they can win
// exactly when they're worth more than the best available hit.
const SCORE = {
  guaranteedKO: 1.5,
  koBeforeFoeActs: 0.3,
  possibleKOBonus: 0.2,
  setupWhenSafe: 0.65,
  healSavesFromKO: 0.35,
  statusSleep: 0.75,
  statusParalysisOnFaster: 0.7,
  statusParalysisBase: 0.35,
  statusBurnOnPhysical: 0.65,
  statusBurnBase: 0.25,
  statusToxic: 0.55,
  statusOther: 0.3,
  hazardStealthRock: 0.75,
  hazardSpikes: 0.6,
  hazardStickyWeb: 0.55,
  hazardToxicSpikes: 0.5,
  utilityFallback: 0.1,
  unprojectable: 0.05,
} as const;

// Setup is only worth it if the projected worst-case hit still leaves us
// healthy enough to use the boosts afterwards.
const SAFE_HP_AFTER_HIT = 0.4;
// Above this HP fraction, healing is premature.
const HEAL_THRESHOLD = 0.6;

const HAZARD_LAYER_CAPS: Record<string, number> = {
  stealthrock: 1,
  spikes: 3,
  toxicspikes: 2,
  stickyweb: 1,
};

const stageMultiplier = (stage: number): number =>
  stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);

/** Effective speed including stat stages and paralysis. */
export const effectiveSpeed = (p: PokemonState): number => {
  const base = toCalcPokemon(p).rawStats.spe;
  const staged = base * stageMultiplier(p.boosts.spe ?? 0);
  return p.status === "par" ? staged * 0.5 : staged;
};

export type ScoredMove = {
  name: string;
  category: MoveCategory;
  score: number;
  /** Human-readable justification, used in debug output and tests. */
  why: string;
  /** Set on damaging moves whose minimum roll KOs the target. */
  koGuaranteed?: boolean;
  /** Set when that KO also lands before the foe can act. */
  koBeforeFoeActs?: boolean;
};

const scoreDamaging = (
  moveName: string,
  snapshot: BattleSnapshot,
  actsFirst: boolean
): ScoredMove => {
  const { self, foe } = snapshot;
  const estimate = estimateDamage(self.active, foe.active, moveName);
  if (!estimate) {
    return { name: moveName, category: "damaging", score: SCORE.unprojectable, why: "unprojectable" };
  }

  const foeCalc = toCalcPokemon(foe.active);
  const foeCurHP = foeCalc.curHP();
  if (foeCurHP <= 0) {
    return { name: moveName, category: "damaging", score: 0, why: "target already fainted" };
  }

  const expected = (estimate.min + estimate.max) / 2;
  let score = Math.min(expected / foeCurHP, 1);
  let why = `expected ${(100 * expected) / foeCurHP | 0}% of current HP`;
  let koGuaranteed = false;
  let koBeforeFoeActs = false;

  if (estimate.min >= foeCurHP) {
    koGuaranteed = true;
    score += SCORE.guaranteedKO;
    why = "guaranteed KO";
    if (actsFirst) {
      koBeforeFoeActs = true;
      score += SCORE.koBeforeFoeActs;
      why = "guaranteed KO before the foe acts";
    }
  } else if (estimate.max >= foeCurHP) {
    score += SCORE.possibleKOBonus;
    why = "possible KO on a high roll";
  }

  return { name: moveName, category: "damaging", score, why, koGuaranteed, koBeforeFoeActs };
};

const scoreSetup = (
  moveName: string,
  snapshot: BattleSnapshot,
  incoming: IncomingProjection
): ScoredMove => {
  const { self } = snapshot;
  const classified = classifyMove(moveName)!;

  // Diminishing returns: if the stats this move raises are already high,
  // another dance is worth little.
  const stages = Object.keys(classified.selfBoosts).map((stat) => self.active.boosts[stat as keyof typeof self.active.boosts] ?? 0);
  const highestExisting = stages.length ? Math.max(...stages) : 0;
  if (highestExisting >= 4) {
    return { name: moveName, category: "setup", score: 0, why: "already fully set up" };
  }

  const hpAfterHit = incoming.defenderCurHP - incoming.maxDamage;
  const safe = hpAfterHit > SAFE_HP_AFTER_HIT * incoming.defenderMaxHP;
  if (!safe) {
    return { name: moveName, category: "setup", score: 0, why: "too dangerous to set up into this hit" };
  }

  const scale = 1 - highestExisting / 4;
  return {
    name: moveName,
    category: "setup",
    score: SCORE.setupWhenSafe * scale,
    why: "safe to set up",
  };
};

const scoreHealing = (
  moveName: string,
  snapshot: BattleSnapshot,
  incoming: IncomingProjection
): ScoredMove => {
  const { self } = snapshot;
  const classified = classifyMove(moveName)!;
  const maxHP = incoming.defenderMaxHP;
  const curHP = incoming.defenderCurHP;
  const healAmount = classified.healFraction * maxHP;

  // Healing through a guaranteed KO wastes the turn.
  if (incoming.maxDamage >= curHP + healAmount) {
    return { name: moveName, category: "healing", score: 0, why: "foe KOs through the heal" };
  }

  const hpFraction = self.active.hpFraction;
  if (hpFraction > HEAL_THRESHOLD) {
    return { name: moveName, category: "healing", score: SCORE.unprojectable, why: "HP too high to spend a turn healing" };
  }

  // Value the HP actually restored, scaled up by urgency; converting a
  // would-be KO into survival earns a flat bonus on top.
  const restored = Math.min(classified.healFraction, 1 - hpFraction);
  const urgency = 1 + (1 - hpFraction);
  const savesFromKO = incoming.maxDamage >= curHP;
  const score = restored * urgency + (savesFromKO ? SCORE.healSavesFromKO : 0);
  return {
    name: moveName,
    category: "healing",
    score,
    why: savesFromKO ? "heal survives the hit that would have KOed" : "recovering while it's safe",
  };
};

const hasType = (p: PokemonState, type: string): boolean => {
  const species = gen9.species.get(p.species);
  return Boolean(species?.types.includes(type as (typeof species.types)[number]));
};

const statusImmune = (target: PokemonState, status: string, moveName: string): boolean => {
  if (status === "par" && hasType(target, "Electric")) return true;
  // Thunder Wave specifically is an Electric-type move, blocked by Ground types.
  if (status === "par" && moveName === "Thunder Wave" && hasType(target, "Ground")) return true;
  if (status === "brn" && hasType(target, "Fire")) return true;
  if ((status === "psn" || status === "tox") && (hasType(target, "Poison") || hasType(target, "Steel"))) return true;
  return false;
};

const scoreStatus = (moveName: string, snapshot: BattleSnapshot): ScoredMove => {
  const { self, foe } = snapshot;
  const classified = classifyMove(moveName)!;
  const status = classified.inflictsStatus!;

  // Most status moves fail redundantly against an already-statused target.
  if (foe.active.status) {
    return { name: moveName, category: "status", score: 0, why: "target is already statused" };
  }
  if (statusImmune(foe.active, status, moveName)) {
    return { name: moveName, category: "status", score: 0, why: "target is immune to this status" };
  }

  let score: number = SCORE.statusOther;
  let why = "generic cripple";
  if (status === "slp") {
    score = SCORE.statusSleep;
    why = "sleep neutralizes the threat";
  } else if (status === "par") {
    const foeFaster = effectiveSpeed(foe.active) > effectiveSpeed(self.active);
    score = foeFaster ? SCORE.statusParalysisOnFaster : SCORE.statusParalysisBase;
    why = foeFaster ? "paralysis flips the speed matchup" : "paralysis on a slower target";
  } else if (status === "brn") {
    const foeCalc = toCalcPokemon(foe.active);
    const physical = foeCalc.rawStats.atk > foeCalc.rawStats.spa;
    score = physical ? SCORE.statusBurnOnPhysical : SCORE.statusBurnBase;
    why = physical ? "burn halves a physical attacker" : "burn on a special attacker";
  } else if (status === "tox") {
    score = SCORE.statusToxic + (foe.active.hpFraction > 0.7 ? 0.1 : 0);
    why = "toxic pressures a long-term threat";
  }

  return { name: moveName, category: "status", score, why };
};

const scoreHazard = (moveName: string, snapshot: BattleSnapshot): ScoredMove => {
  const { foe, turn } = snapshot;
  const classified = classifyMove(moveName)!;
  const hazard = classified.hazard!;

  const layers = foe.sideConditions[hazard] ?? 0;
  const cap = HAZARD_LAYER_CAPS[hazard] ?? 1;
  if (layers >= cap) {
    return { name: moveName, category: "hazard", score: 0, why: "hazard already at maximum layers" };
  }
  if (foe.bench.length === 0) {
    return { name: moveName, category: "hazard", score: 0, why: "nothing left to switch in onto it" };
  }

  const base =
    hazard === "stealthrock" ? SCORE.hazardStealthRock
    : hazard === "spikes" ? SCORE.hazardSpikes * (1 - layers / 3)
    : hazard === "stickyweb" ? SCORE.hazardStickyWeb
    : SCORE.hazardToxicSpikes * (1 - layers / 2);

  // Hazards pay off over the battle's remaining switches — worth much more on
  // turn 1 than turn 10.
  const earliness = Math.max(0.2, 1 - (turn - 1) / 10);
  return { name: moveName, category: "hazard", score: base * earliness, why: "laying hazards early" };
};

/**
 * Score every move the active Pokémon has, on one comparable scale.
 * `incoming` is computed once per turn and threaded through so setup/healing
 * judgments and switch decisions all use the same projection.
 */
export const scoreMoves = (snapshot: BattleSnapshot, incoming: IncomingProjection): ScoredMove[] => {
  const { self, foe } = snapshot;

  return self.active.moves.map((moveName) => {
    const classified = classifyMove(moveName);
    if (!classified) {
      return { name: moveName, category: "utility" as const, score: 0, why: "unknown move" };
    }

    switch (classified.primary) {
      case "damaging": {
        const actsFirst =
          classified.priority > 0 || effectiveSpeed(self.active) > effectiveSpeed(foe.active);
        return scoreDamaging(moveName, snapshot, actsFirst);
      }
      case "setup":
        return scoreSetup(moveName, snapshot, incoming);
      case "healing":
        return scoreHealing(moveName, snapshot, incoming);
      case "status":
        return scoreStatus(moveName, snapshot);
      case "hazard":
        return scoreHazard(moveName, snapshot);
      case "utility":
        return { name: moveName, category: "utility" as const, score: SCORE.utilityFallback, why: "generic utility" };
    }
  });
};
