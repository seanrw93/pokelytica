import { describe, expect, it } from "vitest";
import { trainerSeeds } from "../prisma/trainerData";
import { TRAINER_SPRITE_IDS } from "../prisma/trainerSpriteIds";
import { validateAllTrainerSeeds } from "../prisma/validateTrainerSeeds";

describe("trainer seed data integrity", () => {
  it("has no validation errors (spriteId, species, ability, nature, item, moves all real)", () => {
    const errors = validateAllTrainerSeeds(trainerSeeds);
    const details = errors.map((e) => `[${e.trainer}] ${e.message}`).join("\n");

    expect(errors, details).toEqual([]);
  });

  it("every trainer's spriteId resolves to a real @pkmn/img trainer sprite", () => {
    for (const trainer of trainerSeeds) {
      expect(TRAINER_SPRITE_IDS.has(trainer.spriteId), `${trainer.name}: spriteId "${trainer.spriteId}"`).toBe(true);
    }
  });

  it("every trainer has exactly 6 Pokémon slots", () => {
    for (const trainer of trainerSeeds) {
      expect(trainer.team, trainer.name).toHaveLength(6);
    }
  });

  it("has no duplicate trainer names", () => {
    const names = trainerSeeds.map((t) => t.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it("spans at least two generations", () => {
    const generations = new Set(trainerSeeds.map((t) => t.generation));

    expect(generations.size).toBeGreaterThanOrEqual(2);
  });
});
