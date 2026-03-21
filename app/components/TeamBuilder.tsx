"use client";
import { useState } from "react";
import { DexSpecies, DexMove, DexItem, DexAbility, DexNature, TeamSlot, DexLearnset, BattleOutcome } from "@/lib/types";
import { PokemonCard } from "./PokemonCard";
import { PokemonSet } from "@/lib/types";
import { Spinner } from "./Spinner";


type TeamBuilderProps = {
  pokemon: DexSpecies[];
  moves: DexMove[];
  items: DexItem[];
  abilities: DexAbility[];
  natures: DexNature[];
  learnsets: DexLearnset[];
};

export const TeamBuilder = ({ pokemon, moves, items, abilities, natures, learnsets }: TeamBuilderProps) => {
    const [teamA, setTeamA] = useState<TeamSlot[]>(Array(6).fill(null));
    const [teamB, setTeamB] = useState<TeamSlot[]>(Array(6).fill(null));

    const [result, setResult] = useState<BattleOutcome | null>(null);    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateTeam = (
        team: TeamSlot[],
        setTeam: (t: TeamSlot[]) => void,
        index: number,
        updated: Partial<PokemonSet>
    ) => {
        const newTeam = [...team];

        if (!newTeam[index]) {
            newTeam[index] = {
            species: "",
            item: "",
            ability: "",
            nature: null,
            level: 50,
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            moves: []
        };
    }

        newTeam[index] = {
            ...newTeam[index]!,
            ...updated
        };

        setTeam(newTeam);
    };

    const runSimulation = async (e: React.SubmitEvent | React.MouseEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        const validA = teamA.filter(Boolean);
        const validB = teamB.filter(Boolean);

        if (validA.length === 0 || validB.length === 0) {
            console.log("Make sure both teams have at least one pokemon");
            setLoading(false);
            setError("Make sure both teams have at least one pokemon");
            return;
        }

        try {
            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamA: validA, teamB: validB })
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error("Error sending pkmn data: ", err);
            setError("Error sending pkmn data: " + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">

            <h1 className="text-3xl font-bold text-white">Team Builder</h1>

            <form onSubmit={runSimulation}>
                {/* Two-team responsive layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Team A */}
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Team A</h2>
                        <div className="space-y-4">
                            {teamA.map((slot, i) => (
                            <div
                                key={i}
                                className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm"
                            >
                                <PokemonCard
                                    index={i}
                                    speciesList={pokemon}
                                    moves={moves}
                                    learnsets={learnsets}
                                    items={items}
                                    abilities={abilities}
                                    natures={natures}
                                    onChange={(slotIndex, updated) =>
                                        updateTeam(teamA, setTeamA, slotIndex, updated)
                                    }
                                />
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Team B</h2>
                        <div className="space-y-4">
                            {teamB.map((slot, i) => (
                            <div
                                key={i}
                                className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm"
                            >
                                <PokemonCard
                                    index={i}
                                    speciesList={pokemon}
                                    moves={moves}
                                    learnsets={learnsets}
                                    items={items}
                                    abilities={abilities}
                                    natures={natures}
                                    onChange={(slotIndex, updated) =>
                                        updateTeam(teamB, setTeamB, slotIndex, updated)
                                    }
                                />
                            </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`${!error && "hidden"} mt-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700`}>
                    {error}
                </div>


                {/* Run Simulation Button */}
                {!loading ? (
                    <Spinner />
                ) : (
                    <button
                        onClick={runSimulation}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Run simulation
                    </button>
                )}
            </form>

            {/* AI battle analysis and log */}
           {result && (
  <div className="mt-6 space-y-4">
    {/* Win percentage bar */}
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">Results ({result.totalBattles} battles)</h2>
      <div className="flex rounded-full overflow-hidden h-8 mb-2">
        <div
          className="bg-blue-600 flex items-center justify-center text-white text-sm font-semibold"
          style={{ width: `${result.p1WinPct}%` }}
        >
          {result.p1WinPct}%
        </div>
        <div
          className="bg-red-600 flex items-center justify-center text-white text-sm font-semibold"
          style={{ width: `${result.p2WinPct}%` }}
        >
          {result.p2WinPct}%
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>🔵 Team A — {result.p1Wins} wins</span>
        <span>Ties — {result.ties}</span>
        <span>{result.p2Wins} wins — Team B 🔴</span>
      </div>
    </div>

    {/* Analysis */}
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-2">Analysis</h2>
      <p className="text-gray-300 whitespace-pre-wrap">{result.analysis}</p>
    </div>
  </div>
)}
        </div>
    )
}