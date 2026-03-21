import { Learnset } from "@pkmn/dex";
import { TeamBuilder } from "../components/TeamBuilder";

const baseUrl = process.env.NODE_ENV === "production"
                    ? process.env.CLIENT_URL
                    : "http://localhost:3000"

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
            pokemon={pokemon}
            moves={moves}
            items={items}
            abilities={abilities}
            natures={natures}
            learnsets={learnsets}
        />
  );
}

export default Page;