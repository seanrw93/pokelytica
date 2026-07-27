import { describe, expect, it } from "vitest";
import { estimateDamage, projectWorstCaseIncoming } from "@/lib/battle-ai/projection";
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

describe("estimateDamage", () => {
  it("returns null for status moves", () => {
    expect(estimateDamage(mon({ species: "Garchomp" }), mon({ species: "Skarmory" }), "Swords Dance")).toBeNull();
  });

  it("projects more damage from a boosted attacker than an unboosted one", () => {
    const attacker = mon({ species: "Garchomp" });
    const boosted = mon({ species: "Garchomp", boosts: { atk: 2 } });
    const target = mon({ species: "Tyranitar" });

    const base = estimateDamage(attacker, target, "Earthquake")!;
    const withBoost = estimateDamage(boosted, target, "Earthquake")!;
    expect(withBoost.max).toBeGreaterThan(base.max);
  });

  it("halves physical damage from a burned attacker", () => {
    const attacker = mon({ species: "Garchomp" });
    const burned = mon({ species: "Garchomp", status: "brn" });
    const target = mon({ species: "Tyranitar" });

    const base = estimateDamage(attacker, target, "Earthquake")!;
    const withBurn = estimateDamage(burned, target, "Earthquake")!;
    expect(withBurn.max).toBeLessThan(base.max * 0.6);
  });

  it("projects zero damage into a type immunity", () => {
    const attacker = mon({ species: "Garchomp" });
    const flying = mon({ species: "Skarmory" });
    const estimate = estimateDamage(attacker, flying, "Earthquake")!;
    expect(estimate.max).toBe(0);
  });
});

describe("projectWorstCaseIncoming", () => {
  it("picks the foe's strongest move against the current defender", () => {
    // Vs a Water/Ground type, Giga Drain (4x) massively out-damages Thunderbolt (immune).
    const foe = mon({ species: "Roserade", moves: ["Giga Drain", "Sludge Bomb", "Shadow Ball"] });
    const self = mon({ species: "Swampert" });

    const projection = projectWorstCaseIncoming(foe, self);
    expect(projection.moveName).toBe("Giga Drain");
    expect(projection.maxDamage).toBeGreaterThan(0);
  });

  it("reports zero threat from a foe with no damaging moves", () => {
    const foe = mon({ species: "Blissey", moves: ["Soft-Boiled", "Toxic", "Thunder Wave"] });
    const self = mon({ species: "Garchomp" });

    const projection = projectWorstCaseIncoming(foe, self);
    expect(projection.moveName).toBeNull();
    expect(projection.maxDamage).toBe(0);
    expect(projection.wouldKO).toBe(false);
  });

  it("flags a KO when the defender's remaining HP is inside the foe's max roll", () => {
    // Tyranitar takes ~half from Earthquake at these levels: survives from
    // full, dies from 20%.
    const foe = mon({ species: "Garchomp", moves: ["Earthquake"] });
    const healthy = mon({ species: "Tyranitar" });
    const wounded = mon({ species: "Tyranitar", hpFraction: 0.2 });

    expect(projectWorstCaseIncoming(foe, healthy).wouldKO).toBe(false);
    expect(projectWorstCaseIncoming(foe, wounded).wouldKO).toBe(true);
  });

  it("accounts for the defender's defensive boosts", () => {
    const foe = mon({ species: "Garchomp", moves: ["Earthquake"] });
    const self = mon({ species: "Tyranitar" });
    const fortified = mon({ species: "Tyranitar", boosts: { def: 2 } });

    const base = projectWorstCaseIncoming(foe, self);
    const boosted = projectWorstCaseIncoming(foe, fortified);
    expect(boosted.maxDamage).toBeLessThan(base.maxDamage);
  });
});
