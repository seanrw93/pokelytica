import { describe, expect, it } from "vitest";
import { chooseAction, chooseForcedSwitch } from "@/lib/battle-ai/chooseAction";
import type { BattleSnapshot, PokemonState } from "@/lib/battle-ai/state";

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
    bench: extra.foeBench ?? [mon({ species: "Blissey" })],
    sideConditions: extra.foeSideConditions ?? {},
  },
});

describe("chooseAction", () => {
  it("takes the KO when one is available", () => {
    const snap = snapshot(
      mon({ species: "Garchomp", moves: ["Earthquake", "Swords Dance"] }),
      mon({ species: "Heatran", hpFraction: 0.25, moves: ["Lava Plume"] })
    );

    const action = chooseAction(snap);
    expect(action).toMatchObject({ kind: "move", name: "Earthquake" });
  });

  it("stays in and attacks by default even in a mediocre matchup", () => {
    const snap = snapshot(
      mon({ species: "Garchomp", moves: ["Earthquake"] }),
      mon({ species: "Rotom-Wash", moves: ["Hydro Pump"] }),
      { selfBench: [mon({ species: "Blissey", moves: ["Seismic Toss"] })] }
    );

    // Rotom-Wash levitates in spirit but EQ still projects; the point is that
    // a survivable matchup with a usable attack shouldn't trigger a switch.
    const action = chooseAction(snap);
    expect(action.kind).toBe("move");
  });

  it("proactively switches out of a doomed matchup when the bench is clearly better", () => {
    // Garchomp: slower than Weavile, 4x weak to its Ice Punch, cannot KO first.
    const snap = snapshot(
      mon({ species: "Garchomp", moves: ["Earthquake"] }),
      mon({ species: "Weavile", moves: ["Ice Punch", "Knock Off"] }),
      { selfBench: [mon({ species: "Heatran", moves: ["Lava Plume", "Flash Cannon"] })] }
    );

    const action = chooseAction(snap);
    expect(action).toMatchObject({ kind: "switch", species: "Heatran" });
  });

  it("does not switch when trapped-style empty bench leaves no options", () => {
    const snap = snapshot(
      mon({ species: "Garchomp", moves: ["Earthquake"] }),
      mon({ species: "Weavile", moves: ["Ice Punch"] }),
      { selfBench: [] }
    );

    expect(chooseAction(snap).kind).toBe("move");
  });
});

describe("chooseForcedSwitch", () => {
  it("picks the best matchup on the bench after a faint", () => {
    const snap = snapshot(
      mon({ species: "Garchomp", hpFraction: 0, moves: [] }),
      mon({ species: "Weavile", moves: ["Ice Punch", "Knock Off"] }),
      {
        selfBench: [
          mon({ species: "Dragonite", moves: ["Outrage"] }), // also 4x weak to Ice
          mon({ species: "Heatran", moves: ["Lava Plume"] }),
        ],
      }
    );

    const action = chooseForcedSwitch(snap);
    expect(action).toMatchObject({ kind: "switch", species: "Heatran", benchIndex: 1 });
  });

  it("returns null with an empty bench", () => {
    const snap = snapshot(
      mon({ species: "Garchomp", hpFraction: 0 }),
      mon({ species: "Weavile" }),
      { selfBench: [] }
    );
    expect(chooseForcedSwitch(snap)).toBeNull();
  });
});
