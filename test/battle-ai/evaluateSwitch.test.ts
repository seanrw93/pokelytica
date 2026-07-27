import { describe, expect, it } from "vitest";
import { evaluateMatchup, evaluateSwitches, typeEffectiveness } from "@/lib/battle-ai/evaluateSwitch";
import type { PokemonState } from "@/lib/battle-ai/state";

const mon = (overrides: Partial<PokemonState>): PokemonState => ({
  species: "Pikachu",
  level: 50,
  moves: [],
  hpFraction: 1,
  status: "",
  boosts: {},
  ...overrides,
});

describe("typeEffectiveness", () => {
  it("multiplies across dual types", () => {
    expect(typeEffectiveness("Ice", ["Dragon", "Ground"])).toBe(4);
    // Fire resists Fire (0.5) but hits Steel super effectively (2): net neutral.
    expect(typeEffectiveness("Fire", ["Fire", "Steel"])).toBe(1);
    expect(typeEffectiveness("Fire", ["Water", "Dragon"])).toBe(0.25);
    expect(typeEffectiveness("Ground", ["Steel", "Flying"])).toBe(0);
    expect(typeEffectiveness("Water", ["Normal"])).toBe(1);
  });
});

describe("evaluateMatchup", () => {
  it("rewards threatening the foe and punishes being threatened", () => {
    const weavile = mon({ species: "Weavile", moves: ["Ice Punch", "Knock Off"] });
    // Garchomp is 4x weak to Weavile's Ice; Heatran resists Ice and threatens back.
    const garchomp = mon({ species: "Garchomp", moves: ["Earthquake"] });
    const heatran = mon({ species: "Heatran", moves: ["Lava Plume"] });

    expect(evaluateMatchup(heatran, weavile)).toBeGreaterThan(evaluateMatchup(garchomp, weavile));
  });

  it("prefers the faster side of an otherwise equal matchup", () => {
    const foe = mon({ species: "Blissey", moves: ["Seismic Toss"] });
    const healthy = mon({ species: "Garchomp", moves: ["Earthquake"] });
    const paralyzed = mon({ species: "Garchomp", moves: ["Earthquake"], status: "par" });

    expect(evaluateMatchup(healthy, foe)).toBeGreaterThan(evaluateMatchup(paralyzed, foe));
  });
});

describe("evaluateSwitches", () => {
  it("ranks the bench best-first against the foe's active", () => {
    const foe = mon({ species: "Heatran", moves: ["Lava Plume", "Flash Cannon"] });
    const bench = [
      mon({ species: "Abomasnow", moves: ["Blizzard", "Wood Hammer"] }), // 4x weak to Fire
      mon({ species: "Swampert", moves: ["Earthquake", "Surf"] }), // resists Fire, 4x threat back
    ];

    const ranked = evaluateSwitches(bench, foe);
    expect(ranked[0].species).toBe("Swampert");
    expect(ranked[0].benchIndex).toBe(1);
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("returns an empty ranking for an empty bench", () => {
    expect(evaluateSwitches([], mon({ species: "Heatran" }))).toEqual([]);
  });
});
