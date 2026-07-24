import { TeamBuilder } from "../components/team-builder/TeamBuilder";
import { getPokemon, getMoves, getItems, getAbilities, getNatures, getLearnsets, getTrainerByName } from "@/lib/data";
import type { TeamSlot } from "@/lib/types";

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ trainer?: string }>;
};

const Page = async ({ searchParams }: PageProps) => {
  const { trainer: trainerName } = await searchParams;

  const [pokemon, moves, items, abilities, natures, learnsets, trainer] = await Promise.all([
    getPokemon(),
    getMoves(),
    getItems(),
    getAbilities(),
    getNatures(),
    getLearnsets(),
    trainerName ? getTrainerByName(trainerName) : Promise.resolve(null),
  ]);

  return (
    <TeamBuilder
      pokemon={pokemon}
      moves={moves}
      items={items}
      abilities={abilities}
      natures={natures}
      learnsets={learnsets}
      initialTeamB={trainer ? (trainer.team as unknown as TeamSlot[]) : undefined}
      opponentName={trainer?.name}
    />
  );
};

export default Page;
