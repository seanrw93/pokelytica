import { BattleStreams, RandomPlayerAI } from "@pkmn/sim";

export type MoveSlot = { name: string } | null;

export type PokemonSlot = {
  species: string;
  item: string;
  ability: string;
  nature: string | { name: string } | null;
  level: number;
  evs: Record<string, number>;
  ivs: Record<string, number>;
  moves: MoveSlot[];
};

export const toShowdownSet = (slot: PokemonSlot) => ({
  name: slot.species,
  species: slot.species,
  item: slot.item,
  ability: slot.ability,
  moves: slot.moves?.filter(Boolean).map((m) => (m as { name: string }).name),
  nature: typeof slot.nature === "string" ? slot.nature : (slot.nature?.name ?? ""),
  evs: slot.evs,
  ivs: slot.ivs,
  level: slot.level,
});

export const describeTeam = (team: PokemonSlot[]) =>
  team
    .filter(Boolean)
    .map(
      (p) =>
        `${p.species} — Ability: ${p.ability}, Nature: ${typeof p.nature === "string" ? p.nature : p.nature?.name}, Moves: ${p.moves
          ?.filter(Boolean)
          .map((m) => (m as { name: string }).name)
          .join(", ")}`,
    )
    .join("\n");

export const summarizeLogs = (logs: string[]) => {
  const summary = {
    totalTurns: 0,
    moveUsage: {} as Record<string, number>,
    faintedPokemon: {} as Record<string, number>,
  };

  for (const log of logs) {
    const lines = log.split("\n");
    let turnCount = 0;

    for (const line of lines) {
      if (line.startsWith("|turn|")) turnCount++;
      if (line.startsWith("|move|")) {
        const move = line.split("|")[3];
        if (move) summary.moveUsage[move] = (summary.moveUsage[move] ?? 0) + 1;
      }
      if (line.startsWith("|faint|")) {
        const pokemon = line.split("|")[2];
        if (pokemon) summary.faintedPokemon[pokemon] = (summary.faintedPokemon[pokemon] ?? 0) + 1;
      }
    }
    summary.totalTurns += turnCount;
  }

  const avgTurns = (summary.totalTurns / logs.length).toFixed(1);
  const topMoves = Object.entries(summary.moveUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([move, count]) => `${move} (${count}x)`)
    .join(", ");
  const faintSummary = Object.entries(summary.faintedPokemon)
    .sort((a, b) => b[1] - a[1])
    .map(([pokemon, count]) => `${pokemon} fainted ${count}/${logs.length} battles`)
    .join("\n");

  return { avgTurns, topMoves, faintSummary };
};

export const runSingleBattle = async (
  p1Team: unknown[],
  p2Team: unknown[],
): Promise<{ winner: "p1" | "p2" | "tie"; log: string }> => {
  const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());

  const p1spec = { name: "Team A", team: p1Team };
  const p2spec = { name: "Team B", team: p2Team };
  const spec = { formatid: "gen9customgame" };

  let winner: "p1" | "p2" | "tie" = "tie";
  const log: string[] = [];

  const logPromise = (async () => {
    for await (const chunk of streams.omniscient) {
      log.push(chunk);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("|win|")) {
          const winnerName = line.slice(5).trim();
          winner = winnerName === "Team A" ? "p1" : "p2";
        }
      }
    }
  })();

  const p1AI = new RandomPlayerAI(streams.p1);
  const p2AI = new RandomPlayerAI(streams.p2);
  void p1AI.start();
  void p2AI.start();

  await streams.omniscient.write(
    `>start ${JSON.stringify(spec)}\n` +
      `>player p1 ${JSON.stringify(p1spec)}\n` +
      `>player p2 ${JSON.stringify(p2spec)}`,
  );

  await logPromise;

  return { winner, log: log.join("\n") };
};

const NUM_BATTLES = 100;

export const runBattles = async (teamA: PokemonSlot[], teamB: PokemonSlot[]) => {
  const p1Team = teamA.filter(Boolean).map(toShowdownSet);
  const p2Team = teamB.filter(Boolean).map(toShowdownSet);

  let p1Wins = 0;
  let p2Wins = 0;
  let ties = 0;
  let lastLog = "";
  const allLogs: string[] = [];

  for (let i = 0; i < NUM_BATTLES; i++) {
    const { winner, log } = await runSingleBattle(p1Team, p2Team);
    allLogs.push(log);
    if (i === NUM_BATTLES - 1) lastLog = log;
    if (winner === "p1") p1Wins++;
    else if (winner === "p2") p2Wins++;
    else ties++;
  }

  const p1WinPct = ((p1Wins / NUM_BATTLES) * 100).toFixed(1);
  const p2WinPct = ((p2Wins / NUM_BATTLES) * 100).toFixed(1);
  const tiePct = ((ties / NUM_BATTLES) * 100).toFixed(1);
  const { avgTurns, topMoves, faintSummary } = summarizeLogs(allLogs);

  return {
    p1WinPct,
    p2WinPct,
    tiePct,
    p1Wins,
    p2Wins,
    ties,
    totalBattles: NUM_BATTLES,
    avgTurns,
    topMoves,
    faintSummary,
    lastLog,
  };
};
