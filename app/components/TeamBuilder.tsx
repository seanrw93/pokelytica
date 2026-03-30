"use client";

import { useState, useRef } from "react";
import { useScrollIntoView } from "../hooks/useScrollIntoView";
import { DexSpecies, DexMove, DexItem, DexAbility, DexNature, TeamSlot, DexLearnset, BattleOutcome, Stats } from "@/lib/types";
import { PokemonCard } from "./PokemonCard";
import { WinPercentrageBar } from "./WinPercentrageBar";
import { BattleAnalysis } from "./BattleAnalysis";
import { Spinner } from "./Spinner";
import { PokemonSet } from "@/lib/types";
import { RemoveAllButton } from "./RemoveAllButton";
import { motion } from "motion/react"

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

    const targetRef = useRef<HTMLDivElement | null>(null);

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
                ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
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

    useScrollIntoView({ targetRef, deps: [result] });

    return (
        <div className="p-6 space-y-8">

            <motion.h1 
                className="text-3xl font-bold text-foreground"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 12,
                    mass: 0.8,
                    delay: 0.3
                }}
            >
                Team Builder
            </motion.h1>

            <form onSubmit={runSimulation}>
                {/* Two-team responsive layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Team A */}
                    <motion.div 
                        className="bg-surface p-4 rounded-xl border border-border shadow-md"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 12,
                            mass: 0.8,
                            delay: 0.3
                        }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-accent-yellow">Player</h2>
                        <div className="space-y-4">
                            {teamA.map((slot, i) => (
                            <div
                                key={`${teamAKey}-${i}`}
                                className="bg-surface-raised p-4 rounded-lg border border-border shadow-sm"
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
                    </motion.div>

                    {/* Team B */}
                    <motion.div 
                        className="bg-surface p-4 rounded-xl border border-border shadow-md"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 12,
                            mass: 0.8,
                            delay: 0.3
                        }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-accent-red">Opponent</h2>
                        <div className="space-y-4">
                            {teamB.map((slot, i) => (
                                <div
                                    key={`${teamBKey}-${i}`}
                                    className="bg-surface-raised p-4 rounded-lg border border-border shadow-sm"
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
                    </motion.div>
                </div>

                {error && (
                    <div className="mt-3 text-center rounded-md border border-error bg-surface px-4 py-3 text-sm text-[var(--error)]">
                        {error}
                    </div>
                )}

                {/* Run Simulation Button */}
                {loading ? (
                    <Spinner />
                ) : (
                    <motion.div
                        className="flex justify-center mt-8"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 12,
                            mass: 0.8,
                            delay: 0.3
                        }}
                    >
                        <button
                            className="w-full sm:w-auto bg-accent-yellow hover:bg-[var(--accent-yellow-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-surface px-6 py-3 rounded-lg font-semibold sm:rounded-full transition-colors duration-200 cursor-pointer"
                            
                        >
                            Run simulation
                        </button>
                    </motion.div>
                )}
            </form>

            {/* AI battle analysis and log */}
            {result && (
                <div ref={targetRef} className="mt-6 space-y-4">
                    <WinPercentrageBar 
                        totalBattles={result.totalBattles}
                        p1WinPct={result.p1WinPct}
                        p2WinPct={result.p2WinPct}
                        p1Wins={result.p1Wins}
                        p2Wins={result.p2Wins}
                        ties={result.ties}
                    />
                    <BattleAnalysis analysis={result.analysis} />
                </div>
            )}
        </div>
    )
}