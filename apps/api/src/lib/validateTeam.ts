import type { PokemonSlot } from "./battleSim";

export type TeamValidationError = { team: string; slot: number; message: string };

// @pkmn/sim throws synchronously while constructing a Pokemon with no species
// or no moves, and that throw isn't reliably caught by the route's own
// try/catch (it happens inside the battle stream's internal write handling,
// not the awaited promise chain) — it takes the whole Koa process down, not
// just the one request. Rejecting malformed teams here, before they ever
// reach the simulator, is the actual fix; the try/catch is not sufficient
// on its own.
export const validateTeam = (team: PokemonSlot[], teamLabel: string): TeamValidationError[] => {
  const errors: TeamValidationError[] = [];

  team.forEach((mon, i) => {
    if (!mon.species) {
      errors.push({ team: teamLabel, slot: i, message: `${teamLabel} slot ${i + 1} has no species selected` });
      return;
    }

    const moveCount = (mon.moves ?? []).filter(Boolean).length;
    if (moveCount === 0) {
      errors.push({
        team: teamLabel,
        slot: i,
        message: `${teamLabel} slot ${i + 1} (${mon.species}) has no moves selected`,
      });
    }
  });

  return errors;
};
