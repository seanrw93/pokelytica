import { describe, expect, it } from "vitest";
import { classifyMove, classifyAllMoves } from "@/lib/battle-ai/classifyMove";

describe("classifyMove", () => {
  it("classifies plain attacks as damaging", () => {
    expect(classifyMove("Thunderbolt")?.primary).toBe("damaging");
    expect(classifyMove("Earthquake")?.primary).toBe("damaging");
    // Fixed-damage moves have basePower 0 but are still damaging, not status.
    expect(classifyMove("Seismic Toss")?.primary).toBe("damaging");
  });

  it("classifies net-positive self-boosting moves as setup", () => {
    expect(classifyMove("Swords Dance")?.primary).toBe("setup");
    expect(classifyMove("Nasty Plot")?.primary).toBe("setup");
    expect(classifyMove("Dragon Dance")?.primary).toBe("setup");
    // Shell Smash trades -1/-1 for +2/+2/+2 — net positive, still setup.
    const shellSmash = classifyMove("Shell Smash");
    expect(shellSmash?.primary).toBe("setup");
    expect(shellSmash?.netSelfBoost).toBe(4);
  });

  it("does not classify foe-targeted stat drops as setup", () => {
    expect(classifyMove("Growl")?.primary).toBe("utility");
    expect(classifyMove("Charm")?.primary).toBe("utility");
  });

  it("classifies heal and drain moves as healing", () => {
    const recover = classifyMove("Recover");
    expect(recover?.primary).toBe("healing");
    expect(recover?.healFraction).toBe(0.5);

    expect(classifyMove("Roost")?.primary).toBe("healing");
    expect(classifyMove("Moonlight")?.categories).toContain("healing");

    // Giga Drain damages first and heals off it: damaging primary, healing too.
    const gigaDrain = classifyMove("Giga Drain");
    expect(gigaDrain?.primary).toBe("damaging");
    expect(gigaDrain?.categories).toContain("healing");
    expect(gigaDrain?.drainFraction).toBe(0.5);
  });

  it("classifies target-status moves as status with the right ailment", () => {
    expect(classifyMove("Toxic")?.inflictsStatus).toBe("tox");
    expect(classifyMove("Thunder Wave")?.inflictsStatus).toBe("par");
    expect(classifyMove("Will-O-Wisp")?.inflictsStatus).toBe("brn");
    expect(classifyMove("Toxic")?.primary).toBe("status");
    // Scald's burn is a secondary chance on a damaging move, not a status move.
    expect(classifyMove("Scald")?.primary).toBe("damaging");
    expect(classifyMove("Scald")?.inflictsStatus).toBeNull();
  });

  it("classifies foe-side sideConditions as hazards, ally-side ones as utility", () => {
    expect(classifyMove("Stealth Rock")?.hazard).toBe("stealthrock");
    expect(classifyMove("Spikes")?.hazard).toBe("spikes");
    expect(classifyMove("Toxic Spikes")?.hazard).toBe("toxicspikes");
    expect(classifyMove("Sticky Web")?.primary).toBe("hazard");
    // Screens sit on your own side — utility, not hazard.
    expect(classifyMove("Reflect")?.primary).toBe("utility");
    expect(classifyMove("Light Screen")?.primary).toBe("utility");
  });

  it("classifies remaining status moves as utility", () => {
    expect(classifyMove("Protect")?.primary).toBe("utility");
    expect(classifyMove("Taunt")?.primary).toBe("utility");
    expect(classifyMove("Substitute")?.primary).toBe("utility");
    expect(classifyMove("Encore")?.primary).toBe("utility");
  });

  it("covers the whole gen-9 movedex, including isNonstandard Past moves", () => {
    const all = classifyAllMoves();
    expect(all.size).toBeGreaterThan(700);
    // Return is isNonstandard: "Past" but legal in gen9customgame — the format
    // the simulator actually runs — so it must be classified, not skipped.
    expect(all.has("return")).toBe(true);
    for (const move of all.values()) {
      expect(move.categories.length).toBeGreaterThan(0);
      expect(move.primary).toBe(move.categories[0]);
    }
  });
});
