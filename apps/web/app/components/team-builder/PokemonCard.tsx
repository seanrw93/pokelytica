"use client";

import { useMemo, useState } from "react";
import { DexSpecies, DexMove, DexItem, DexAbility, DexNature, DexLearnset, Stats } from "@/lib/types";
import { ItemSearchSelect } from "./ItemSearchSelect";
import { StatEditor } from "./StatEditor";
import { getSpriteUrl } from "../../utils/getSprite";

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
  const [evs, setEvs] = useState<Stats>({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
  const [ivs, setIvs] = useState<Stats>({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 });
  const [advancedIsChecked, setAdvancedIsChecked] = useState(false);
  const [spriteLoaded, setSpriteLoaded] = useState<Boolean | null>(null);

  const selectedSpecies = useMemo(() => speciesList.find(s => s.name === species), [speciesList, species]);
  const learnset = useMemo(() => learnsets.find(l => l.id === selectedSpecies?.id)?.learnset ?? {}, [learnsets, selectedSpecies]);

  const availableMoves = moves.filter(move => {
    return learnset.hasOwnProperty(move.id);
  });

  const availableAbilities = selectedSpecies
    ? Object.values(selectedSpecies.abilities)
    : [];

  const handleSpeciesChange = (value: string | null) => {
    setSpecies(value);
    setSpriteLoaded(false);
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
    <div className="bg-surface rounded-lg border border-border">

      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-surface-raised transition-colors duration-150 rounded-lg"
      >
        <div className="flex justify-between w-full">
          <span className="flex place-items-center text-lg font-semibold text-foreground">
            {species ?? `Pokémon ${index + 1}`}
          </span>
          {species &&  (
            <img
              src={getSpriteUrl(species)}
              alt={species}
              className={`w-12 h-12 object-contain transition-opacity duration-300 ${spriteLoaded === true ? 'opacity-100' : 'opacity-0 hidden'}`}
              onLoad={() => setSpriteLoaded(true)}
            />
          )}
        </div>
        <span className="text-muted text-sm ml-3">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">

          {/* Sprite */}
          {species && (
            <div className="flex justify-center mb-2">
              <img
                src={getSpriteUrl(species)}
                alt={species}
                className="w-24 h-24 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-opacity duration-300 ${spriteLoaded ? 'opacity-100' : 'opacity-0 hidden'}"
                onLoad={() => setSpriteLoaded(true)}
              />
            </div>
          )}

          {/* Species Selector */}
          <div>
            <label className="text-sm text-muted-light">Species</label>
            <ItemSearchSelect
              options={speciesList.map(s => s.name)}
              value={species}
              onChange={(val) => handleSpeciesChange(val)}
              placeholder="Search Pokémon..."
            />
          </div>

          {/* Item Selector */}
          <div>
            <label className="text-sm text-muted-light">Item</label>
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
            <label className="text-sm text-muted-light">Ability</label>
            <select
              value={ability ?? ""}
              onChange={(e) => {
                setAbility(e.target.value);
                onChange(index, { ability: e.target.value });
              }}
              className="w-full mt-1 p-2 rounded bg-surface-raised border border-border text-foreground cursor-pointer disabled:text-muted disabled:cursor-not-allowed focus:outline-none focus:border-accent-blue transition-colors duration-150"
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
            <label className="text-sm text-muted-light">Nature</label>
            <select
              value={nature ?? ""}
              onChange={(e) => {
                const selected = natures.find(n => n.name === e.target.value) ?? null;
                setNature(e.target.value);
                onChange(index, { nature: selected });
              }}
              className="w-full mt-1 p-2 rounded bg-surface-raised border border-border text-foreground cursor-pointer focus:outline-none focus:border-accent-blue transition-colors duration-150"
            >
              <option value="">Select a Nature</option>
              {natures.map((n) => (
                <option key={n.id} value={n.name}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Moves Selector */}
          <div>
            <label className="text-sm text-muted-light">Moves</label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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

          {/* Advanced Content */}
          <div>
            <label className="text-sm text-muted-light flex justify-items-center items-start gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                className="cursor-pointer accent-accent-yellow mt-0.5"
                checked={advancedIsChecked}
                onChange={(e) => setAdvancedIsChecked(e.target.checked)}
              />
              Check for advanced options
            </label>

            {advancedIsChecked && (
              <>
                <StatEditor
                  label="EVs"
                  stats={evs}
                  min={0}
                  max={252}
                  onChange={(updated) => {
                    setEvs(updated);
                    onChange(index, { evs: updated });
                  }}
                />

                <div className="mt-8">
                  <StatEditor
                    label="IVs"
                    stats={ivs}
                    min={0}
                    max={31}
                    onChange={(updated) => {
                      setEvs(updated);
                      onChange(index, { evs: updated });
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};