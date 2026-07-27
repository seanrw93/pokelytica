import { describe, expect, it } from "vitest";
import { BattleTracker, parseCondition, parseDetails } from "@/lib/battle-ai/tracker";

describe("parseCondition", () => {
  it("parses hp fractions, statuses and faints", () => {
    expect(parseCondition("63/100 par")).toEqual({ hpFraction: 0.63, status: "par", fainted: false });
    expect(parseCondition("100/100")).toEqual({ hpFraction: 1, status: "", fainted: false });
    expect(parseCondition("0 fnt")).toEqual({ hpFraction: 0, status: "", fainted: true });
    // Own-side conditions use absolute HP.
    expect(parseCondition("146/292")).toEqual({ hpFraction: 0.5, status: "", fainted: false });
  });
});

describe("parseDetails", () => {
  it("parses species and level", () => {
    expect(parseDetails("Garchomp, L50, M")).toEqual({ species: "Garchomp", level: 50 });
    expect(parseDetails("Rotom-Wash")).toEqual({ species: "Rotom-Wash", level: 100 });
  });
});

describe("BattleTracker", () => {
  const trackerFor = (lines: string[]): BattleTracker => {
    const t = new BattleTracker();
    t.setMySide("p1");
    for (const line of lines) t.observe(line);
    return t;
  };

  it("tracks the foe's active Pokémon through switches, damage and status", () => {
    const t = trackerFor([
      "|switch|p2a: Garchomp|Garchomp, L50, M|100/100",
      "|-damage|p2a: Garchomp|55/100",
      "|-status|p2a: Garchomp|brn",
    ]);

    expect(t.foeActive()).toMatchObject({ species: "Garchomp", level: 50, hpFraction: 0.55, status: "brn" });
  });

  it("remembers a foe's HP when it switches out and back in", () => {
    const t = trackerFor([
      "|switch|p2a: Garchomp|Garchomp, L50, M|100/100",
      "|-damage|p2a: Garchomp|40/100",
      "|switch|p2a: Blissey|Blissey, L50, F|100/100",
      "|switch|p2a: Garchomp|Garchomp, L50, M|40/100",
    ]);

    expect(t.foeActive()?.hpFraction).toBe(0.4);
  });

  it("tracks boosts on the active and clears them on switch", () => {
    const t = trackerFor([
      "|switch|p2a: Garchomp|Garchomp, L50, M|100/100",
      "|-boost|p2a: Garchomp|atk|2",
      "|-boost|p2a: Garchomp|atk|2",
      "|-unboost|p2a: Garchomp|atk|1",
    ]);
    expect(t.foeBoosts()).toEqual({ atk: 3 });

    t.observe("|switch|p2a: Blissey|Blissey, L50, F|100/100");
    expect(t.foeBoosts()).toEqual({});
  });

  it("tracks hazard layers per side, including stacking and removal", () => {
    const t = trackerFor([
      "|-sidestart|p2: Team B|move: Stealth Rock",
      "|-sidestart|p2: Team B|Spikes",
      "|-sidestart|p2: Team B|Spikes",
      "|-sidestart|p1: Team A|move: Stealth Rock",
    ]);

    expect(t.foeSideConditions()).toEqual({ stealthrock: 1, spikes: 2 });
    expect(t.mySideConditions()).toEqual({ stealthrock: 1 });

    t.observe("|-sideend|p2: Team B|Spikes");
    expect(t.foeSideConditions()).toEqual({ stealthrock: 1 });
  });

  it("marks fainted foes and tracks the turn counter", () => {
    const t = trackerFor([
      "|turn|4",
      "|switch|p2a: Garchomp|Garchomp, L50, M|10/100",
      "|-damage|p2a: Garchomp|0 fnt",
      "|faint|p2a: Garchomp",
    ]);

    expect(t.turn).toBe(4);
    expect(t.foeTeam().find((m) => m.species === "Garchomp")?.fainted).toBe(true);
  });
});
