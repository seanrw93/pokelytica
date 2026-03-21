// -----------------------------
// Basic stat structure
// -----------------------------
export type Stats = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

// -----------------------------
// Pokémon Set (one Pokémon)
// -----------------------------
export interface PokemonSet {
  species: string;       // "Garchomp"
  item: string;          // "Choice Scarf"
  ability: string;       // "Rough Skin"
  nature: DexNature | null;        // "Jolly"
  level: number;         // usually 50 or 100
  evs: Stats;            // EVs
  ivs: Stats;            // IVs
  moves: (DexMove | null)[];       // ["Earthquake", "Dragon Claw", ...]
}

// -----------------------------
// A Team (6 Pokémon)
// -----------------------------
export interface Team {
  pokemon: PokemonSet[];
}

export type TeamSlot = PokemonSet | null;

export type MoveSlot = DexMove | null;

// -----------------------------
// Dex Data Types (from your API)
// -----------------------------
export interface DexSpecies {
  id: string;            // "garchomp"
  name: string;          // "Garchomp"
  types: string[];       // ["Dragon", "Ground"]
  baseStats: Stats;      // base stats
  abilities: Record<string, string>; // {0: "Sand Veil", H: "Rough Skin"}
  weight: number;        // weight in kg
  forme?: string;        // "Mega", "Alola", etc.
  baseSpecies: string;   // "Garchomp"
  isNonstandard?: string | null;
  learnset?: Record<string, string[]>;
}

export interface DexMove {
  id: string;
  name: string;
  type: string;
  category: string;
  power: number;
  accuracy: number | true;
  priority: number;
  target: string;
}

export interface DexItem {
  id: string;
  name: string;
  shortDesc?: string;
}

export interface DexAbility {
  id: string;
  name: string;
  shortDesc?: string;
}

export interface DexNature {
  id: string;
  name: string;
  plus?: string;
  minus?: string;
}

export interface DexLearnset {
  id: string;
  learnset: Record<string, string[]>
}

export interface BattleOutcome {
  p1WinPct: string;
  p2WinPct: string;
  tiePct: string;
  p1Wins: number;
  p2Wins: number;
  ties: number;
  totalBattles: number;
  analysis: string;
}
