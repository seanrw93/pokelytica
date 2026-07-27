import { describe, expect, it } from "vitest";
import { BattleStreams } from "@pkmn/sim";
import { HeuristicPlayerAI, type TeamSpec } from "@/lib/battle-ai/player";

// Mirrors the real /api/simulate production path — full 6v6 teams, a
// 100-battle loop — rather than the small hand-built scenarios elsewhere in
// this suite. Two things this catches that unit tests can't: whether
// @smogon/calc running per damaging move per turn blows the runtime budget
// at production scale, and whether the adapter has a p1/p2 slot bias (each
// roster plays both slots across the run, so a lopsided result reflects
// team quality, not which stream the roster happened to be attached to).

const teamA: TeamSpec[] = [
  { species: "Garchomp", ability: "Rough Skin", item: "Choice Band", nature: "Jolly", level: 50,
    moves: ["Earthquake", "Outrage", "Stone Edge", "Iron Head"], evs: { atk: 252, spe: 252, hp: 4 } },
  { species: "Rotom-Wash", ability: "Levitate", item: "Sitrus Berry", nature: "Modest", level: 50,
    moves: ["Hydro Pump", "Volt Switch", "Will-O-Wisp", "Pain Split"], evs: { hp: 252, spa: 252, def: 4 } },
  { species: "Heatran", ability: "Flash Fire", item: "Air Balloon", nature: "Timid", level: 50,
    moves: ["Magma Storm", "Earth Power", "Flash Cannon", "Taunt"], evs: { hp: 4, spa: 252, spe: 252 } },
  { species: "Skarmory", ability: "Sturdy", item: "Rocky Helmet", nature: "Impish", level: 50,
    moves: ["Stealth Rock", "Spikes", "Whirlwind", "Body Press"], evs: { hp: 252, def: 252, spe: 4 } },
  { species: "Toxapex", ability: "Regenerator", item: "Black Sludge", nature: "Calm", level: 50,
    moves: ["Scald", "Toxic Spikes", "Recover", "Haze"], evs: { hp: 252, spd: 252, def: 4 } },
  { species: "Dragapult", ability: "Infiltrator", item: "Choice Specs", nature: "Timid", level: 50,
    moves: ["Draco Meteor", "Shadow Ball", "Flamethrower", "U-turn"], evs: { spa: 252, spe: 252, hp: 4 } },
];

const teamB: TeamSpec[] = [
  { species: "Weavile", ability: "Pressure", item: "Life Orb", nature: "Jolly", level: 50,
    moves: ["Ice Punch", "Knock Off", "Ice Shard", "Swords Dance"], evs: { atk: 252, spe: 252, hp: 4 } },
  { species: "Blissey", ability: "Natural Cure", item: "Leftovers", nature: "Calm", level: 50,
    moves: ["Seismic Toss", "Soft-Boiled", "Toxic", "Thunder Wave"], evs: { hp: 252, def: 252, spd: 4 } },
  { species: "Tyranitar", ability: "Sand Stream", item: "Choice Scarf", nature: "Jolly", level: 50,
    moves: ["Stone Edge", "Crunch", "Earthquake", "Ice Punch"], evs: { atk: 252, spe: 252, hp: 4 } },
  { species: "Corviknight", ability: "Pressure", item: "Leftovers", nature: "Impish", level: 50,
    moves: ["Body Press", "Roost", "U-turn", "Iron Defense"], evs: { hp: 252, def: 252, spe: 4 } },
  { species: "Gengar", ability: "Cursed Body", item: "Life Orb", nature: "Timid", level: 50,
    moves: ["Shadow Ball", "Sludge Wave", "Nasty Plot", "Focus Blast"], evs: { spa: 252, spe: 252, hp: 4 } },
  { species: "Landorus-Therian", ability: "Intimidate", item: "Choice Scarf", nature: "Jolly", level: 50,
    moves: ["Earthquake", "U-turn", "Stone Edge", "Superpower"], evs: { atk: 252, spe: 252, hp: 4 } },
];

/**
 * Runs one battle with the roster assignment the caller chooses for p1/p2,
 * and reports the winner as "teamA" / "teamB" regardless of which engine
 * slot each roster occupied — so results are comparable across slot-swapped
 * runs instead of conflating "which team" with "which slot."
 */
const runSingleBattle = async (
  p1Roster: { name: "teamA" | "teamB"; team: TeamSpec[] },
  p2Roster: { name: "teamA" | "teamB"; team: TeamSpec[] }
): Promise<"teamA" | "teamB" | "tie"> => {
  const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
  let winnerLabel: "Player 1" | "Player 2" | "tie" = "tie";
  const logPromise = (async () => {
    for await (const chunk of streams.omniscient) {
      for (const line of chunk.split("\n")) {
        if (line.startsWith("|win|")) winnerLabel = line.slice(5).trim() === "Player 1" ? "Player 1" : "Player 2";
      }
    }
  })();

  void new HeuristicPlayerAI(streams.p1, { team: p1Roster.team, opponentTeam: p2Roster.team }).start();
  void new HeuristicPlayerAI(streams.p2, { team: p2Roster.team, opponentTeam: p1Roster.team }).start();

  await streams.omniscient.write(
    `>start ${JSON.stringify({ formatid: "gen9customgame" })}\n` +
      `>player p1 ${JSON.stringify({ name: "Player 1", team: p1Roster.team })}\n` +
      `>player p2 ${JSON.stringify({ name: "Player 2", team: p2Roster.team })}`
  );
  await logPromise;
  if (winnerLabel === "tie") return "tie";
  return winnerLabel === "Player 1" ? p1Roster.name : p2Roster.name;
};

const rosterA = { name: "teamA" as const, team: teamA };
const rosterB = { name: "teamB" as const, team: teamB };

describe("production-scale check", () => {
  it("completes 100 full 6v6 battles within a reasonable time, with roster/slot assignment alternated to rule out slot bias", async () => {
    const NUM_BATTLES = 100;
    const start = Date.now();
    let teamAWins = 0;
    let teamBWins = 0;
    let ties = 0;

    for (let i = 0; i < NUM_BATTLES; i++) {
      const winner =
        i % 2 === 0 ? await runSingleBattle(rosterA, rosterB) : await runSingleBattle(rosterB, rosterA);
      if (winner === "teamA") teamAWins++;
      else if (winner === "teamB") teamBWins++;
      else ties++;
    }

    const elapsedMs = Date.now() - start;
    console.log(
      `100 battles in ${elapsedMs}ms (${(elapsedMs / NUM_BATTLES).toFixed(0)}ms/battle) — ` +
        `Team A ${teamAWins}, Team B ${teamBWins}, ties ${ties}`
    );

    expect(teamAWins + teamBWins + ties).toBe(NUM_BATTLES);
    // Every battle should resolve; an all-ties result would mean a hang or a
    // loop bug rather than a real playthrough.
    expect(ties).toBeLessThan(NUM_BATTLES * 0.1);
  }, 180_000);
});
