import { Generations, Generation, Data } from "@pkmn/data";
import { Dex } from "@pkmn/dex";

// The default @pkmn/data exists() predicate excludes anything isNonstandard,
// including "Past" — stricter than what @pkmn/sim's gen9customgame format
// (which the simulator actually runs) allows. Mirror the simulator's
// permissiveness so classification covers every move the battles can contain.
const existsForSim = (d: Data) => {
  if (!d.exists) return false;
  if ("isNonstandard" in d && d.isNonstandard && d.isNonstandard !== "Past") return false;
  return !("tier" in d && d.tier === "Illegal");
};

const gens = new Generations(Dex, existsForSim);

export const gen9: Generation = gens.get(9);
