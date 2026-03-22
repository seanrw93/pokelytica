"use client";

import { useState } from "react";
import { DexSpecies, DexMove, DexItem, DexAbility, DexNature, TeamSlot, DexLearnset, BattleOutcome } from "@/lib/types";
import { PokemonCard } from "./PokemonCard";
import { WinPercentrageBar } from "./WinPercentrageBar";
import { BattleAnalysis } from "./BattleAnalysis";
import { Spinner } from "./Spinner";
import { PokemonSet } from "@/lib/types";
import { RemoveAllButton } from "./RemoveAllButton";

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
    const [teamAKey, setTeamAKey] = useState(0);
    const [teamBKey, setTeamBKey] = useState(0);

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

    const hasAnyPokemon = (team: TeamSlot[]) => {
       return team.some(slot => slot !== null && slot.species !== "");
    }

    const handleRemoveAll = (
        setTeam: (t: TeamSlot[]) => void,
        setTeamKey: (updater: (k: number) => number) => void
    ) => {
        setTeam(Array(6).fill(null));
        setTeamKey(k => k + 1)
    }

    const runSimulation = async (e: React.SubmitEvent | React.MouseEvent) => {
        e.preventDefault();
        console.log("running simulation")
        setLoading(true);
        setError(null);

        const validA = teamA.filter(Boolean);
        const validB = teamB.filter(Boolean);

        try {
            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamA: validA, teamB: validB })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }
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

            <h1 className="font-default-color text-3xl font-bold l">Team Builder</h1>

            <form onSubmit={runSimulation}>
                {/* Two-team responsive layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Team A */}
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Player</h2>
                        <div className="space-y-4">
                            {teamA.map((slot, i) => (
                            <div
                                key={`${teamAKey}-${i}`}
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
                        {hasAnyPokemon(teamA) && (
                            <RemoveAllButton onRemoveAll={() => handleRemoveAll(setTeamA, setTeamAKey)} />
                        )}
                    </div>

                    {/* Team B */}
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Opponent</h2>
                        <div className="space-y-4">
                            {teamB.map((slot, i) => (
                                <div
                                    key={`${teamAKey}-${i}`}
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
                        {hasAnyPokemon(teamB) && (
                            <RemoveAllButton onRemoveAll={() => handleRemoveAll(setTeamB, setTeamBKey)} />
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-3 text-center rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Run Simulation Button */}
                {loading ? (
                    <Spinner />
                ) : (
                    <button
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white mt-4 px-6 py-3 rounded-lg font-semibold"
                    >
                        Run simulation
                    </button>
                )}
            </form>

            {/* AI battle analysis and log */}
            {result && (
                <div className="mt-6 space-y-4">
                    {/* Win percentage bar */}
                    <WinPercentrageBar 
                        totalBattles={result.totalBattles}
                        p1WinPct={result.p1WinPct}
                        p2WinPct={result.p2WinPct}
                        p1Wins={result.p1Wins}
                        p2Wins={result.p2Wins}
                        ties={result.ties}
                    />

                    {/* Analysis */}
                    <BattleAnalysis analysis={result.analysis} />
                </div>
            )}
        </div>
    )
}