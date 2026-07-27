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

  it("computes Endeavor from real current HP instead of the (broken) generic calc", () => {
    // The exact regression: a Rattata brought to 1 HP by Focus Sash should
    // project bringing a full-HP Garchomp down to 1 HP too, not 0 damage.
    const rattata = mon({ species: "Rattata", hpFraction: 1 / 50 }); // ~1 HP of 50 max
    const garchomp = mon({ species: "Garchomp" });

    const estimate = estimateDamage(rattata, garchomp, "Endeavor")!;
    const garchompMaxHP = estimate.max + 1; // Endeavor should leave exactly 1 HP.
    expect(estimate.min).toBe(estimate.max);
    expect(estimate.max).toBeGreaterThan(garchompMaxHP * 0.9);
  });

  it("Endeavor deals zero damage (fails) when the user's HP is not lower than the target's", () => {
    const healthyRattata = mon({ species: "Rattata" });
    const woundedGarchomp = mon({ species: "Garchomp", hpFraction: 0.1 });
    const estimate = estimateDamage(healthyRattata, woundedGarchomp, "Endeavor")!;
    expect(estimate.max).toBe(0);
  });

  it("computes Super Fang and Ruination as half the target's current HP, not zero", () => {
    const attacker = mon({ species: "Rattata" });
    const fullHP = mon({ species: "Garchomp" });
    const halfHP = mon({ species: "Garchomp", hpFraction: 0.5 });

    const superFang = estimateDamage(attacker, fullHP, "Super Fang")!;
    expect(superFang.max).toBeGreaterThan(0);
    expect(superFang.min).toBe(superFang.max);

    const superFangAtHalf = estimateDamage(attacker, halfHP, "Super Fang")!;
    // Two successive floor/round steps (HP fraction -> absolute, then half of
    // that) can be off by a point from a clean halving — allow slack for that.
    expect(Math.abs(superFangAtHalf.max - superFang.max / 2)).toBeLessThanOrEqual(1);

    const ruination = estimateDamage(attacker, fullHP, "Ruination")!;
    expect(ruination.max).toBe(superFang.max);
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
