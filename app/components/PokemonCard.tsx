"use client";

import { useEffect, useState } from "react";
import { DexSpecies, DexMove, DexItem, DexAbility, DexNature, DexLearnset } from "@/lib/types";
import { ItemSearchSelect } from "./ItemSearchSelect";
import { getSpriteUrl } from "../utils/getSprite";

type PokemonCardProps = {
  index: number;
  speciesList: DexSpecies[];
  moves: DexMove[];
  items: DexItem[];
  abilities: DexAbility[];
  natures: DexNature[];
  learnsets: DexLearnset[];
  onChange: (index: number, updated: any) => void;
};

export const PokemonCard = ({
  index,
  speciesList,
  moves,
  learnsets,
  items,
  abilities,
  natures,
  onChange
}: PokemonCardProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const [species, setSpecies] = useState<string | null>(null);
  const [item, setItem] = useState<string | null>(null);
  const [ability, setAbility] = useState<string | null>(null);
  const [nature, setNature] = useState<string | null>(null);
  const [selectedMoves, setSelectedMoves] = useState<(DexMove | null)[]>(Array(4).fill(null));

  
  const selectedSpecies = speciesList.find(s => s.name === species);
  const learnset = learnsets.find(l => l.id === selectedSpecies?.id)?.learnset ?? {};

  const availableMoves = moves.filter(move => {
    return learnset.hasOwnProperty(move.id);  
  });

  const availableAbilities = selectedSpecies
    ? Object.values(selectedSpecies.abilities)
    : [];

  const handleSpeciesChange = (value: string | null) => {
    setSpecies(value);
    setSelectedMoves(Array(4).fill(null)); 
    setAbility(null);                      
    onChange(index, { species: value });
  }

  const handleMoveChange = (moveIndex: number, val: string | null) => {
    const move = availableMoves.find(m => m.name === val) ?? null; 
    const updated = [...selectedMoves];
    updated[moveIndex] = move;
    setSelectedMoves(updated);
    onChange(index, { moves: updated });
  };

 return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">

      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
      >
        <div className="flex justify-between w-full">
          <span className="text-lg font-semibold text-white align-middle">
            {species ?? `Pokémon ${index + 1}`}
          </span>
          {species && (
            <img
              src={getSpriteUrl(species)}
              alt={species}
              className="w-12 h-12 object-contain"
            />
          )}
        </div>
        <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-700 pt-3">

          {/* Sprite */}
          {species && (
            <div className="flex justify-center mb-2">
              <img
                src={getSpriteUrl(species)}
                alt={species}
                className="w-24 h-24 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              />
            </div>
          )}

          {/* Species Selector */}
          <div>
            <label className="text-sm text-gray-300">Species</label>
            <ItemSearchSelect
              options={speciesList.map(s => s.name)}
              value={species}
              onChange={(val) => handleSpeciesChange(val)}
              placeholder="Search Pokémon..."
            />
          </div>

          {/* Item Selector */}
          <div>
            <label className="text-sm text-gray-300">Item</label>
            <ItemSearchSelect
              options={items.map(i => i.name)}
              value={item}
              onChange={(val) => {
                setItem(val);
                onChange(index, { item: val });
              }}
              placeholder="Search item..."
            />
          </div>

          {/* Ability Selector */}
          <div>
            <label className="text-sm text-gray-300">Ability</label>
            <select
              value={ability ?? ""}
              onChange={(e) => {
                setAbility(e.target.value);
                onChange(index, { ability: e.target.value });
              }}
              className="w-full mt-1 p-2 rounded bg-gray-700 text-white cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={!species}
            >
              <option value="">Select an Ability</option>
              {availableAbilities.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Nature Selector */}
          <div>
            <label className="text-sm text-gray-300">Nature</label>
            <select
              value={nature ?? ""}
              onChange={(e) => {
                const selected = natures.find(n => n.name === e.target.value) ?? null;
                setNature(e.target.value);
                onChange(index, { nature: selected });
              }}
              className="w-full mt-1 p-2 rounded bg-gray-700 text-white cursor-pointer"
            >
              <option value="">Select a Nature</option>
              {natures.map((n) => (
                <option key={n.id} value={n.name}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Moves Selector */}
          <div>
            <label className="text-sm text-gray-300">Moves</label>
            <div  className="grid grid-cols-1 lg:grid-cols-2 gap-2 ">
            {selectedMoves.map((moveVal, i) => (
              <ItemSearchSelect
                key={i}
                options={availableMoves.map(m => m.name)}
                value={moveVal?.name ?? null}
                onChange={(val) => handleMoveChange(i, val)}
                placeholder="Search move..."
                disabled={!species}
              />
            ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
