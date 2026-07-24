import { gen9 } from "./gen9";
import type { RawTrainerMon } from "./trainerData";

// Converts the plain-string authoring format into the same PokemonSet shape
// used by the player's Team.slots JSON (nature/moves as resolved dex objects),
// so a loaded trainer team is a drop-in replacement for a player-built one.
export const resolveTrainerMon = (mon: RawTrainerMon) => {
  const nature = gen9.natures.get(mon.nature)!;

  const moves = mon.moves.map((moveName) => {
    const move = gen9.moves.get(moveName)!;
    return {
      id: move.id,
      name: move.name,
      type: move.type,
      category: move.category,
      power: move.basePower,
      accuracy: move.accuracy,
      priority: move.priority,
      target: move.target,
    };
  });

  return {
    species: mon.species,
    item: mon.item,
    ability: mon.ability,
    nature: { id: nature.id, name: nature.name, plus: nature.plus, minus: nature.minus },
    level: mon.level,
    evs: mon.evs,
    ivs: mon.ivs,
    moves,
  };
};

export const resolveTrainerTeam = (team: RawTrainerMon[]) => team.map(resolveTrainerMon);
