import { PrismaClient } from "../generated/client";
import { resolveTrainerTeam } from "./resolveTrainerTeam";
import { trainerSeeds } from "./trainerData";
import { validateAllTrainerSeeds } from "./validateTrainerSeeds";

const prisma = new PrismaClient();

const main = async () => {
  const errors = validateAllTrainerSeeds(trainerSeeds);

  if (errors.length) {
    const details = errors.map((e) => `  [${e.trainer}] ${e.message}`).join("\n");
    throw new Error(`Trainer seed data failed validation, refusing to seed:\n${details}`);
  }

  for (const trainer of trainerSeeds) {
    await prisma.trainer.upsert({
      where: { name: trainer.name },
      create: {
        name: trainer.name,
        title: trainer.title,
        generation: trainer.generation,
        spriteId: trainer.spriteId,
        team: resolveTrainerTeam(trainer.team),
      },
      update: {
        title: trainer.title,
        generation: trainer.generation,
        spriteId: trainer.spriteId,
        team: resolveTrainerTeam(trainer.team),
      },
    });
  }

  console.log(`Seeded ${trainerSeeds.length} trainers.`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
