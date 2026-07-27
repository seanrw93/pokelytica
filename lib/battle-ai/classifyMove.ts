import type { Move, StatID } from "@pkmn/data";
import { gen9 } from "./dex";

export type MoveCategory =
  | "damaging"
  | "setup"
  | "healing"
  | "status"
  | "hazard"
  | "utility";

export type ClassifiedMove = {
  id: string;
  name: string;
  /** The category the decision engine scores this move under. */
  primary: MoveCategory;
  /** All categories that apply (a drain move is both damaging and healing). */
  categories: MoveCategory[];
  /** Net sum of self-inflicted stat stage changes (Shell Smash: +6 -2 = +4). */
  netSelfBoost: number;
  /** Which self stats this move raises, for "already maxed" checks. */
  selfBoosts: Partial<Record<StatID, number>>;
  /** Fraction of max HP restored by a pure heal (Recover = 0.5). */
  healFraction: number;
  /** Fraction of damage dealt recovered by a drain move (Giga Drain = 0.5). */
  drainFraction: number;
  /** Non-volatile status this move inflicts on the target ('par', 'brn', ...). */
  inflictsStatus: string | null;
  /** sideCondition id when this move lays a hazard on the foe's side. */
  hazard: string | null;
  basePower: number;
  priority: number;
};

const sumBoosts = (boosts: Partial<Record<string, number>> | undefined): number =>
  boosts ? Object.values(boosts).reduce((a: number, b) => a + (b ?? 0), 0) : 0;

const classify = (move: Move): ClassifiedMove => {
  const categories: MoveCategory[] = [];

  const isDamaging = move.category !== "Status";
  if (isDamaging) categories.push("damaging");

  // Setup: net-positive stat boosts applied to the user itself.
  const selfBoosts =
    (move.target === "self" ? move.boosts : undefined) ?? move.self?.boosts ?? undefined;
  const netSelfBoost = sumBoosts(selfBoosts as Partial<Record<string, number>> | undefined);
  if (!isDamaging && netSelfBoost > 0) categories.push("setup");

  // Healing: dedicated heal fraction (Recover), heal flag (Moonlight — fraction
  // resolved at runtime), or a drain field on a damaging move (Giga Drain).
  const healFraction = move.heal
    ? move.heal[0] / move.heal[1]
    : !isDamaging && move.flags.heal
      ? 0.5
      : 0;
  const drainFraction = move.drain ? move.drain[0] / move.drain[1] : 0;
  if (healFraction > 0 || drainFraction > 0) categories.push("healing");

  // Status infliction: a non-volatile status applied to the target as the
  // move's main effect. Damaging moves with secondary chances (Scald) stay
  // classified as damaging — the chance is a bonus, not the plan.
  const inflictsStatus = !isDamaging && move.status ? move.status : null;
  if (inflictsStatus) categories.push("status");

  // Hazards: a sideCondition placed on the foe's side of the field.
  const hazard = move.sideCondition && move.target === "foeSide" ? move.sideCondition : null;
  if (hazard) categories.push("hazard");

  // Everything else non-damaging (Protect, Taunt, Encore, Substitute, screens,
  // hazard removal, ...) falls through to utility.
  if (categories.length === 0) categories.push("utility");

  return {
    id: move.id,
    name: move.name,
    primary: categories[0],
    categories,
    netSelfBoost,
    selfBoosts: (selfBoosts ?? {}) as Partial<Record<StatID, number>>,
    healFraction,
    drainFraction,
    inflictsStatus,
    hazard,
    basePower: move.basePower,
    priority: move.priority,
  };
};

export const classifyMove = (name: string): ClassifiedMove | null => {
  const move = gen9.moves.get(name);
  return move ? classify(move) : null;
};

export const classifyAllMoves = (): Map<string, ClassifiedMove> => {
  const all = new Map<string, ClassifiedMove>();
  for (const move of gen9.moves) all.set(move.id, classify(move));
  return all;
};
