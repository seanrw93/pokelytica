import { NextResponse } from "next/server";
import { dex } from "@/lib/dex";

export const GET = async () => {
    const species = dex.species.all().map(s => ({
        id: s.id,
        name: s.name,
        types: s.types,
        baseStats: s.baseStats,
        abilities: s.abilities,
        weight: s.weightkg,
        isNonStandard: s.isNonstandard,
        baseSpecies: s.baseSpecies
    }))

    return NextResponse.json(species);
}