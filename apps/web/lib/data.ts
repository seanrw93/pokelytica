import { dex } from "./dex"
import { cache } from "react";

export const getPokemon = cache(() =>
    dex.species.all().map(s => ({
        id: s.id,
        name: s.name,
        types: s.types,
        baseStats: s.baseStats,
        abilities: s.abilities as unknown as Record<string, string>,
        weight: s.weightkg,
        isNonStandard: s.isNonstandard,
        baseSpecies: s.baseSpecies
    })));

export const getAbilities = cache(() =>
    dex.abilities.all().map(a => ({
        id: a.id,
        name: a.name,
        shortDesc: a.shortDesc,
    })));

export const getLearnsets = cache(async () =>
    await Promise.all(
        dex.species.all().map(async species => {
        const ls = await dex.learnsets.get(species.id);
        return {
            id: species.id,
            learnset: ls?.learnset ?? {}
        };
    })
));

export const getMoves = cache(() => 
    dex.moves.all().map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        category: m.category,
        power: m.basePower,
        accuracy: m.accuracy,
        priority: m.priority,
        target: m.target,
    })));

export const getItems = cache(() => 
    dex.items.all().map(i => ({
        id: i.id,
        name: i.name,
        shortDesc: i.shortDesc,
    })));

export const getNatures = cache(() => 
    dex.natures.all().map(n => ({
        id: n.id,
        name: n.name,
        plus: n.plus,
        minus: n.minus
    })));