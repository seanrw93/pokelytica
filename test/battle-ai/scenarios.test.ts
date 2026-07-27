import { describe, expect, it } from "vitest";
import { chooseAction } from "@/lib/battle-ai/chooseAction";
import type { BattleSnapshot, PokemonState } from "@/lib/battle-ai/state";

// Scripted tactical scenarios: each constructs the exact battle state by hand
// (no random battles, no simulator) and asserts the engine's single
// chooseAction() entry point makes the humanly-obvious play. Damage rolls in
// @smogon/calc are fixed ranges, so every one of these is deterministic.

const mon = (overrides: Partial<PokemonState>): PokemonState => ({
  species: "Pikachu",
  level: 50,
  moves: [],
  hpFraction: 1,
  status: "",
  boosts: {},
  ...overrides,
});

const snapshot = (
  self: PokemonState,
  foe: PokemonState,
  extra: {
    turn?: number;
    selfBench?: PokemonState[];
    foeBench?: PokemonState[];
    foeSideConditions?: Record<string, number>;
  } = {}
): BattleSnapshot => ({
  turn: extra.turn ?? 1,
  self: { active: self, bench: extra.selfBench ?? [], sideConditions: {} },
  foe: {
    active: foe,
    bench: extra.foeBench ?? [mon({ species: "Snorlax" })],
    sideConditions: extra.foeSideConditions ?? {},
  },
});

describe("scripted tactical scenarios", () => {
  it("1. a fast attacker at full HP with no KO available sets up instead of attacking", () => {
    // Garchomp can't come close to KOing a full Blissey this turn, and
    // Seismic Toss barely dents it — free turn, so Swords Dance.
    const snap = snapshot(
      mon({
        species: "Garchomp",
        moves: ["Swords Dance", "Earthquake"],
        evs: { atk: 252, spe: 252 },
        nature: "Jolly",
      }),
      mon({
        species: "Blissey",
        moves: ["Seismic Toss"],
        evs: { hp: 252, def: 252 },
        nature: "Bold",
      })
    );

    const action = chooseAction(snap);
    expect(action).toMatchObject({ kind: "move", name: "Swords Dance" });
  });

  it("2. at ~25% HP, heals when the foe's projected max damage cannot KO through the heal", () => {
    // Slowbro's Scald threatens Garchomp's remaining 25% but not 75%:
    // Recover converts a likely KO into a comfortable survival.
    const snap = snapshot(
      mon({ species: "Garchomp", hpFraction: 0.25, moves: ["Recover", "Earthquake"] }),
      mon({ species: "Slowbro", moves: ["Scald"] })
    );

    const action = chooseAction(snap);
    expect(action).toMatchObject({ kind: "move", name: "Recover" });
  });

  it("3. at the same low HP, does NOT heal when the foe would KO through the heal", () => {
    // Weavile's 4x Ice Punch deals more than 25% + the 50% Recover restores:
    // healing wastes the turn, so anything but Recover is right.
    const snap = snapshot(
      mon({ species: "Garchomp", hpFraction: 0.25, moves: ["Recover", "Earthquake"] }),
      mon({ species: "Weavile", moves: ["Ice Punch"], evs: { atk: 252, spe: 252 }, nature: "Jolly" }),
      { selfBench: [mon({ species: "Heatran", moves: ["Lava Plume", "Flash Cannon"] })] }
    );

    const action = chooseAction(snap);
    if (action.kind === "move") {
      expect(action.name).not.toBe("Recover");
    } else {
      expect(action.kind).toBe("switch");
    }
  });

  it("4. switches out of a 4x-weak matchup when a clearly better bench option exists", () => {
    // Garchomp is 4x weak to Weavile's Ice and outsped; Heatran resists
    // everything Weavile has and threatens back — switch, don't attack.
    const snap = snapshot(
      mon({ species: "Garchomp", moves: ["Earthquake", "Dragon Claw"] }),
      mon({ species: "Weavile", moves: ["Ice Punch", "Knock Off"], evs: { atk: 252, spe: 252 }, nature: "Jolly" }),
      { selfBench: [mon({ species: "Heatran", moves: ["Lava Plume", "Flash Cannon"] })] }
    );

    const action = chooseAction(snap);
    expect(action).toMatchObject({ kind: "switch", species: "Heatran" });
  });

  it("5. skips a redundant status move against an already-statused target", () => {
    // Garchomp is already paralyzed: Will-O-Wisp would fail, so attack instead.
    const snap = snapshot(
      mon({ species: "Rotom-Wash", moves: ["Will-O-Wisp", "Hydro Pump"] }),
      mon({ species: "Garchomp", status: "par", moves: ["Earthquake"] })
    );

    const action = chooseAction(snap);
    expect(action).toMatchObject({ kind: "move", name: "Hydro Pump" });
  });

  it("6. lays a hazard on a clear field when there's no immediate pressure", () => {
    // Turn 1, no rocks up, Blissey poses no threat, and Peck is pitiful:
    // Stealth Rock is the play.
    const snap = snapshot(
      mon({ species: "Skarmory", moves: ["Stealth Rock", "Peck"] }),
      mon({ species: "Blissey", moves: ["Seismic Toss"], evs: { hp: 252, def: 252 } }),
      { turn: 1, foeBench: [mon({ species: "Garchomp" }), mon({ species: "Weavile" })] }
    );

    const action = chooseAction(snap);
    expect(action).toMatchObject({ kind: "move", name: "Stealth Rock" });

    // And with rocks already up, it must not pick Stealth Rock again.
    const rocksUp = snapshot(
      mon({ species: "Skarmory", moves: ["Stealth Rock", "Peck"] }),
      mon({ species: "Blissey", moves: ["Seismic Toss"], evs: { hp: 252, def: 252 } }),
      { turn: 2, foeSideConditions: { stealthrock: 1 } }
    );
    expect(chooseAction(rocksUp)).toMatchObject({ kind: "move", name: "Peck" });
  });
});
