import { describe, expect, it } from "vitest";
import { projectWorstCaseIncoming } from "@/lib/battle-ai/projection";
import { effectiveSpeed, scoreMoves } from "@/lib/battle-ai/scoreActions";
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
  extra: Partial<Pick<BattleSnapshot, "turn">> & {
    selfBench?: PokemonState[];
    foeBench?: PokemonState[];
    foeSideConditions?: Record<string, number>;
  } = {}
): BattleSnapshot => ({
  turn: extra.turn ?? 1,
  self: { active: self, bench: extra.selfBench ?? [], sideConditions: {} },
  foe: { active: foe, bench: extra.foeBench ?? [mon({ species: "Blissey" })], sideConditions: extra.foeSideConditions ?? {} },
});

const score = (snap: BattleSnapshot, name: string) => {
  const incoming = projectWorstCaseIncoming(snap.foe.active, snap.self.active);
  const scored = scoreMoves(snap, incoming).find((m) => m.name === name);
  if (!scored) throw new Error(`${name} not scored`);
  return scored;
};

describe("effectiveSpeed", () => {
  it("applies stat stages and paralysis", () => {
    const base = effectiveSpeed(mon({ species: "Garchomp" }));
    expect(effectiveSpeed(mon({ species: "Garchomp", boosts: { spe: 2 } }))).toBe(base * 2);
    expect(effectiveSpeed(mon({ species: "Garchomp", status: "par" }))).toBe(base / 2);
  });
});

describe("scoreMoves — damaging", () => {
  it("heavily favors a move that secures a KO this turn", () => {
    const self = mon({ species: "Garchomp", moves: ["Earthquake", "Swords Dance"] });
    const foe = mon({ species: "Heatran", hpFraction: 0.3, moves: ["Lava Plume"] });
    const snap = snapshot(self, foe);

    expect(score(snap, "Earthquake").score).toBeGreaterThan(1);
    expect(score(snap, "Earthquake").score).toBeGreaterThan(score(snap, "Swords Dance").score);
  });

  it("gives an extra bonus for KOing before the foe can act", () => {
    // Garchomp outspeeds Tyranitar: same KO, bigger score than the reverse case.
    const fastSelf = mon({ species: "Garchomp", moves: ["Earthquake"] });
    const slowFoe = mon({ species: "Tyranitar", hpFraction: 0.1, moves: ["Stone Edge"] });
    const fastKO = score(snapshot(fastSelf, slowFoe), "Earthquake");

    const slowSelf = mon({ species: "Tyranitar", moves: ["Stone Edge"] });
    const fastFoe = mon({ species: "Garchomp", hpFraction: 0.05, moves: ["Earthquake"] });
    const slowKO = score(snapshot(slowSelf, fastFoe), "Stone Edge");

    expect(fastKO.score).toBeGreaterThan(slowKO.score);
    expect(fastKO.why).toMatch(/before the foe acts/);
  });
});

describe("scoreMoves — setup", () => {
  it("favors setup when the projected worst-case hit leaves us safe", () => {
    // Blissey barely scratches Garchomp; Swords Dance should beat a weak attack.
    const self = mon({ species: "Garchomp", moves: ["Swords Dance", "Tackle"] });
    const foe = mon({ species: "Blissey", moves: ["Seismic Toss"] });
    const snap = snapshot(self, foe);

    expect(score(snap, "Swords Dance").score).toBeGreaterThan(score(snap, "Tackle").score);
  });

  it("refuses to set up into a hit that would leave us in KO range", () => {
    const self = mon({ species: "Garchomp", hpFraction: 0.45, moves: ["Swords Dance"] });
    const foe = mon({ species: "Weavile", moves: ["Ice Punch"] });
    const snap = snapshot(self, foe);

    expect(score(snap, "Swords Dance").score).toBe(0);
  });

  it("devalues stacking boosts that are already high", () => {
    const fresh = mon({ species: "Garchomp", moves: ["Swords Dance"] });
    const boosted = mon({ species: "Garchomp", boosts: { atk: 4 }, moves: ["Swords Dance"] });
    const foe = mon({ species: "Blissey", moves: ["Seismic Toss"] });

    expect(score(snapshot(boosted, foe), "Swords Dance").score).toBe(0);
    expect(score(snapshot(fresh, foe), "Swords Dance").score).toBeGreaterThan(0);
  });
});

describe("scoreMoves — healing", () => {
  it("scores healing to zero when the foe KOs through the heal", () => {
    const self = mon({ species: "Blissey", hpFraction: 0.15, moves: ["Soft-Boiled"] });
    // Choice Band Close Combat into Blissey annihilates it through a 50% heal.
    const foe = mon({ species: "Rampardos", item: "Choice Band", moves: ["Close Combat"] });
    const snap = snapshot(self, foe);

    expect(score(snap, "Soft-Boiled").score).toBe(0);
    expect(score(snap, "Soft-Boiled").why).toMatch(/KOs through/);
  });

  it("rewards a heal that converts a would-be KO into survival", () => {
    const self = mon({ species: "Garchomp", hpFraction: 0.25, moves: ["Recover"] });
    const foe = mon({ species: "Breloom", moves: ["Mach Punch"] });
    const snap = snapshot(self, foe);

    const healed = score(snap, "Recover");
    expect(healed.score).toBeGreaterThan(0.5);
  });

  it("treats healing at high HP as a wasted turn", () => {
    const self = mon({ species: "Garchomp", hpFraction: 0.95, moves: ["Recover", "Earthquake"] });
    const foe = mon({ species: "Blissey", moves: ["Seismic Toss"] });
    const snap = snapshot(self, foe);

    expect(score(snap, "Recover").score).toBeLessThan(score(snap, "Earthquake").score);
  });
});

describe("scoreMoves — status", () => {
  it("zeroes a status move against an already-statused target", () => {
    const self = mon({ species: "Rotom-Wash", moves: ["Will-O-Wisp"] });
    const foe = mon({ species: "Garchomp", status: "par", moves: ["Earthquake"] });
    const snap = snapshot(self, foe);

    expect(score(snap, "Will-O-Wisp").score).toBe(0);
    expect(score(snap, "Will-O-Wisp").why).toMatch(/already statused/);
  });

  it("zeroes a status move the target is immune to", () => {
    const self = mon({ species: "Rotom-Wash", moves: ["Will-O-Wisp"] });
    const foe = mon({ species: "Heatran", moves: ["Lava Plume"] });
    expect(score(snapshot(self, foe), "Will-O-Wisp").score).toBe(0);
  });

  it("values paralysis more against a faster opponent", () => {
    const slow = mon({ species: "Blissey", moves: ["Thunder Wave"] });
    const fastFoe = mon({ species: "Weavile", moves: ["Knock Off"] });
    const slowFoe = mon({ species: "Snorlax", moves: ["Body Slam"] });

    const vsFast = score(snapshot(slow, fastFoe), "Thunder Wave");
    const vsSlow = score(snapshot(slow, slowFoe), "Thunder Wave");
    expect(vsFast.score).toBeGreaterThan(vsSlow.score);
  });

  it("values burn more against a physical attacker", () => {
    const self = mon({ species: "Rotom-Wash", moves: ["Will-O-Wisp"] });
    const physical = mon({ species: "Garchomp", moves: ["Earthquake"] });
    const special = mon({ species: "Gengar", moves: ["Shadow Ball"] });

    const vsPhysical = score(snapshot(self, physical), "Will-O-Wisp");
    const vsSpecial = score(snapshot(self, special), "Will-O-Wisp");
    expect(vsPhysical.score).toBeGreaterThan(vsSpecial.score);
  });
});

describe("scoreMoves — hazards", () => {
  it("zeroes a hazard already at its layer cap", () => {
    const self = mon({ species: "Skarmory", moves: ["Stealth Rock", "Spikes"] });
    const foe = mon({ species: "Blissey", moves: ["Seismic Toss"] });
    const snap = snapshot(self, foe, { foeSideConditions: { stealthrock: 1, spikes: 3 } });

    expect(score(snap, "Stealth Rock").score).toBe(0);
    expect(score(snap, "Spikes").score).toBe(0);
  });

  it("values hazards on a clear field, more so early in the battle", () => {
    const self = mon({ species: "Skarmory", moves: ["Stealth Rock"] });
    const foe = mon({ species: "Blissey", moves: ["Seismic Toss"] });

    const early = score(snapshot(self, foe, { turn: 1 }), "Stealth Rock");
    const late = score(snapshot(self, foe, { turn: 9 }), "Stealth Rock");
    expect(early.score).toBeGreaterThan(0);
    expect(early.score).toBeGreaterThan(late.score);
  });

  it("zeroes hazards when the foe has no bench left to switch in", () => {
    const self = mon({ species: "Skarmory", moves: ["Stealth Rock"] });
    const foe = mon({ species: "Blissey", moves: ["Seismic Toss"] });
    const snap = snapshot(self, foe, { foeBench: [] });

    expect(score(snap, "Stealth Rock").score).toBe(0);
  });
});
