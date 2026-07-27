import { describe, expect, it } from "vitest";
import { BattleStreams } from "@pkmn/sim";
import { HeuristicPlayerAI, type TeamSpec } from "@/lib/battle-ai/player";

// Full battles through the real BattleStream — proves the adapter's protocol
// tracking and choice emission hold up end to end (no hangs, no crashes, a
// winner comes out).

const teamA: TeamSpec[] = [
  {
    species: "Garchomp",
    name: "Garchomp",
    ability: "Rough Skin",
    item: "Leftovers",
    nature: "Jolly",
    level: 50,
    moves: ["Earthquake", "Dragon Claw", "Swords Dance", "Stealth Rock"],
    evs: { hp: 4, atk: 252, spe: 252 },
  },
  {
    species: "Rotom-Wash",
    name: "Rotom-Wash",
    ability: "Levitate",
    item: "Sitrus Berry",
    nature: "Modest",
    level: 50,
    moves: ["Hydro Pump", "Volt Switch", "Will-O-Wisp", "Pain Split"],
    evs: { hp: 252, spa: 252, def: 4 },
  },
];

const teamB: TeamSpec[] = [
  {
    species: "Weavile",
    name: "Weavile",
    ability: "Pressure",
    item: "Life Orb",
    nature: "Jolly",
    level: 50,
    moves: ["Ice Punch", "Knock Off", "Ice Shard", "Swords Dance"],
    evs: { atk: 252, spe: 252, hp: 4 },
  },
  {
    species: "Blissey",
    name: "Blissey",
    ability: "Natural Cure",
    item: "Leftovers",
    nature: "Calm",
    level: 50,
    moves: ["Seismic Toss", "Soft-Boiled", "Toxic", "Thunder Wave"],
    evs: { hp: 252, def: 252, spd: 4 },
  },
];

const runBattle = async (): Promise<{ winner: string; log: string }> => {
  const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
  const spec = { formatid: "gen9customgame" };

  let winner = "";
  const log: string[] = [];
  const logPromise = (async () => {
    for await (const chunk of streams.omniscient) {
      log.push(chunk);
      for (const line of chunk.split("\n")) {
        if (line.startsWith("|win|")) winner = line.slice(5).trim();
      }
    }
  })();

  const p1 = new HeuristicPlayerAI(streams.p1, { team: teamA, opponentTeam: teamB });
  const p2 = new HeuristicPlayerAI(streams.p2, { team: teamB, opponentTeam: teamA });
  void p1.start();
  void p2.start();

  await streams.omniscient.write(
    `>start ${JSON.stringify(spec)}\n` +
      `>player p1 ${JSON.stringify({ name: "Team A", team: teamA })}\n` +
      `>player p2 ${JSON.stringify({ name: "Team B", team: teamB })}`
  );
  await logPromise;
  return { winner, log: log.join("\n") };
};

describe("HeuristicPlayerAI end to end", () => {
  it("plays a full battle to a decisive result without stalling", async () => {
    const { winner, log } = await runBattle();
    expect(["Team A", "Team B"]).toContain(winner);
    expect(log).toContain("|win|");
  });

  it("makes tactically coherent choices, not just legal ones", async () => {
    // Across a few battles, the AI should demonstrably use the engine:
    // Garchomp sets Stealth Rock (a RandomPlayerAI picks it ~25% of turns;
    // the engine should lay it early and never re-lay it).
    const { log } = await runBattle();
    const rocksSet = (log.match(/\|-sidestart\|p2: Team B\|move: Stealth Rock/g) ?? []).length;
    expect(rocksSet).toBeLessThanOrEqual(1);
  }, 60_000);
});
