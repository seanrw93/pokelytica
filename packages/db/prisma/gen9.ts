import { Generations } from "@pkmn/data";
import { Dex } from "@pkmn/dex";

// @pkmn/data's default exists() check excludes anything isNonstandard, which
// includes "Past" — i.e. every Pokemon/move not in Scarlet/Violet's base
// Paldea dex (Onix, Alakazam, Return, ...). That's stricter than what
// @pkmn/sim's gen9customgame format (used by the actual simulator) allows,
// so validation would reject perfectly simulable teams. Only exclude things
// that are genuinely not real (CAP, unreleased, etc).
const existsForSim = (thing: { exists: boolean; isNonstandard?: string | null }) =>
  thing.exists && (!thing.isNonstandard || thing.isNonstandard === "Past");

const gens = new Generations(Dex, existsForSim);
export const gen9 = gens.get(9);
