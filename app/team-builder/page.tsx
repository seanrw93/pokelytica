import { Learnset } from "@pkmn/dex";
import { TeamBuilder } from "../components/TeamBuilder";

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : "http://localhost:3000";

export const dynamic = 'force-dynamic';

const Page = async () => {
    const [pokemon, moves, items, abilities, natures, learnsets] = await Promise.all([
        fetch(baseUrl + "/api/pokemon").then(r => r.json().catch(err => ({ error: "Error fetching species", details: err }))),
        fetch(baseUrl + "/api/moves").then(r => r.json().catch(err => ({ error: "Error fetching moves", details: err }))),
        fetch(baseUrl + "/api/items").then(r => r.json().catch(err => ({ error: "Error fetching items", details: err }))),
        fetch(baseUrl + "/api/abilities").then(r => r.json().catch(err => ({ error: "Error fetching abilities", details: err }))),
        fetch(baseUrl + "/api/natures").then(r => r.json().catch(err => ({ error: "Error fetching natures", details: err }))),
        fetch(baseUrl + "/api/learnsets").then(r => r.json().catch(err => ({ error: "Error fetching natures", details: err })))
    ]);

    return (
        <TeamBuilder
            pokemon={Array.isArray(pokemon) ? pokemon : []}
            moves={Array.isArray(moves) ? moves : []}
            items={Array.isArray(items) ? items : []}
            abilities={Array.isArray(abilities) ? abilities : []}
            natures={Array.isArray(natures) ? natures : []}
            learnsets={Array.isArray(learnsets) ? learnsets : []}
        />
    );
}

export default Page;