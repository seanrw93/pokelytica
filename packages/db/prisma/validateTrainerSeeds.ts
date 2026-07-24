import { gen9 } from "./gen9";
import { TRAINER_SPRITE_IDS } from "./trainerSpriteIds";
import type { RawTrainer, RawTrainerMon } from "./trainerData";

export type ValidationError = { trainer: string; message: string };

const validateMon = (trainerName: string, mon: RawTrainerMon, errors: ValidationError[]) => {
  const species = gen9.species.get(mon.species);
  if (!species?.exists) {
    errors.push({ trainer: trainerName, message: `Unknown species "${mon.species}"` });
    return;
  }

  const legalAbilities = Object.values(species.abilities);
  if (!legalAbilities.includes(mon.ability)) {
    errors.push({
      trainer: trainerName,
      message: `"${mon.species}" cannot have ability "${mon.ability}" (legal: ${legalAbilities.join(", ")})`,
    });
  }

  const nature = gen9.natures.get(mon.nature);
  if (!nature?.exists) {
    errors.push({ trainer: trainerName, message: `Unknown nature "${mon.nature}" on ${mon.species}` });
  }

  const item = gen9.items.get(mon.item);
  if (!item?.exists) {
    errors.push({ trainer: trainerName, message: `Unknown item "${mon.item}" on ${mon.species}` });
  }

  if (mon.moves.length !== 4) {
    errors.push({
      trainer: trainerName,
      message: `${mon.species} must have exactly 4 moves, got ${mon.moves.length}`,
    });
  }

  for (const moveName of mon.moves) {
    const move = gen9.moves.get(moveName);
    if (!move?.exists) {
      errors.push({ trainer: trainerName, message: `Unknown move "${moveName}" on ${mon.species}` });
    }
  }
};

export const validateTrainerSeed = (trainer: RawTrainer): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!TRAINER_SPRITE_IDS.has(trainer.spriteId)) {
    errors.push({
      trainer: trainer.name,
      message: `spriteId "${trainer.spriteId}" is not a real @pkmn/img trainer sprite key`,
    });
  }

  if (trainer.team.length !== 6) {
    errors.push({ trainer: trainer.name, message: `team must have exactly 6 Pokémon, got ${trainer.team.length}` });
  }

  for (const mon of trainer.team) {
    validateMon(trainer.name, mon, errors);
  }

  return errors;
};

export const validateAllTrainerSeeds = (trainers: RawTrainer[]): ValidationError[] =>
  trainers.flatMap(validateTrainerSeed);
