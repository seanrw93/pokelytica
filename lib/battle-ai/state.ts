// Plain-data battle-state snapshot the decision engine works from.
//
// Deliberately decoupled from @pkmn/sim's request/protocol shapes so every
// piece of the engine is a pure function of hand-constructable state — the
// stream adapter translates live protocol into this, and tests build it
// directly.

export type StatName = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

export type StatTable = Partial<Record<StatName, number>>;

export type PokemonState = {
  species: string;
  level: number;
  item?: string;
  ability?: string;
  nature?: string;
  evs?: StatTable;
  ivs?: StatTable;
  /** Move names (not ids). */
  moves: string[];
  /** 0..1 of max HP. 1 = full, 0 = fainted. */
  hpFraction: number;
  /** Non-volatile status: 'brn' | 'par' | 'psn' | 'tox' | 'slp' | 'frz' | ''. */
  status: string;
  /** Stat stages, -6..+6. */
  boosts: StatTable;
};

export type SideState = {
  active: PokemonState;
  /** Healthy bench Pokémon available to switch to (excludes fainted). */
  bench: PokemonState[];
  /** Hazard/side-condition layers keyed by id: { stealthrock: 1, spikes: 2 }. */
  sideConditions: Record<string, number>;
};

export type BattleSnapshot = {
  turn: number;
  self: SideState;
  foe: SideState;
};
