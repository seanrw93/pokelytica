import { TeamBuilder } from "../components/TeamBuilder";
import { getPokemon, getMoves, getItems, getAbilities, getNatures, getLearnsets } from "@/lib/data";

export const dynamic = 'force-dynamic';

const Page = async () => {
  const [pokemon, moves, items, abilities, natures, learnsets] = await Promise.all([
    getPokemon(),
    getMoves(),
    getItems(),
    getAbilities(),
    getNatures(),
    getLearnsets(),
  ]);

  return (
    <TeamBuilder
      pokemon={pokemon}
      moves={moves}
      items={items}
      abilities={abilities}
      natures={natures}
      learnsets={learnsets}
    />
  );
};

export default Page;