import { NextRequest, NextResponse } from 'next/server';
import { BattleStreams } from '@pkmn/sim';
import { PokemonSet, DexMove } from '@/lib/types';
import { RandomPlayerAI } from '@pkmn/sim';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const toShowdownSet = (slot: PokemonSet) => ({
  name: slot.species,
  species: slot.species,
  item: slot.item,
  ability: slot.ability,
  moves: slot.moves?.filter(Boolean).map(m => (m as DexMove).name),
  nature: typeof slot.nature === 'string' ? slot.nature : slot.nature?.name ?? '',
  evs: slot.evs,
  ivs: slot.ivs,
  level: slot.level,
});

const describeTeam = (team: PokemonSet[]) =>
  team.filter(Boolean).map(p =>
    `${p.species} — Ability: ${p.ability}, Nature: ${typeof p.nature === 'string' ? p.nature : p.nature?.name}, Moves: ${p.moves?.filter(Boolean).map(m => (m as DexMove).name).join(', ')}`
  ).join('\n');

const summarizeLogs = (logs: string[]) => {
  const summary = {
    totalTurns: 0,
    moveUsage: {} as Record<string, number>,
    faintedPokemon: {} as Record<string, number>,
  };

  for (const log of logs) {
    const lines = log.split('\n');
    let turnCount = 0;

    for (const line of lines) {
      if (line.startsWith('|turn|')) turnCount++;
      if (line.startsWith('|move|')) {
        const move = line.split('|')[3];
        if (move) summary.moveUsage[move] = (summary.moveUsage[move] ?? 0) + 1;
      }
      if (line.startsWith('|faint|')) {
        const pokemon = line.split('|')[2];
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
    .join(', ');
  const faintSummary = Object.entries(summary.faintedPokemon)
    .sort((a, b) => b[1] - a[1])
    .map(([pokemon, count]) => `${pokemon} fainted ${count}/${logs.length} battles`)
    .join('\n');

  return { avgTurns, topMoves, faintSummary };
};

const runSingleBattle = async (
  p1Team: any[],
  p2Team: any[]
): Promise<{ winner: 'p1' | 'p2' | 'tie'; log: string }> => {
  const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());

  const p1spec = { name: 'Team A', team: p1Team };
  const p2spec = { name: 'Team B', team: p2Team };
  const spec = { formatid: 'gen9customgame' };

  let winner: 'p1' | 'p2' | 'tie' = 'tie';
  const log: string[] = [];

  const logPromise = (async () => {
    for await (const chunk of streams.omniscient) {
      log.push(chunk);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('|win|')) {
          const winnerName = line.slice(5).trim();
          winner = winnerName === 'Team A' ? 'p1' : 'p2';
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
    `>player p2 ${JSON.stringify(p2spec)}`
  );

  await logPromise;

  return { winner, log: log.join('\n') };
};

export const POST = async (req: NextRequest) => {
  try {
    const { teamA, teamB } = await req.json();

    const p1Team = teamA.filter(Boolean).map(toShowdownSet);
    const p2Team = teamB.filter(Boolean).map(toShowdownSet);

    if (!p1Team.length || !p2Team.length) {
      return NextResponse.json({ error: 'Both teams must have at least one Pokémon' }, { status: 400 });
    }

    const NUM_BATTLES = 100;
    let p1Wins = 0;
    let p2Wins = 0;
    let ties = 0;
    let lastLog = '';
    const allLogs: string[] = [];

    console.log(`Running ${NUM_BATTLES} battles...`);

    for (let i = 0; i < NUM_BATTLES; i++) {
      if (i % 10 === 0) console.log(`Battle ${i}/${NUM_BATTLES}`);
      const { winner, log } = await runSingleBattle(p1Team, p2Team);
      allLogs.push(log);
      if (i === NUM_BATTLES - 1) lastLog = log;
      if (winner === 'p1') p1Wins++;
      else if (winner === 'p2') p2Wins++;
      else ties++;
    }

    const p1WinPct = ((p1Wins / NUM_BATTLES) * 100).toFixed(1);
    const p2WinPct = ((p2Wins / NUM_BATTLES) * 100).toFixed(1);
    const tiePct = ((ties / NUM_BATTLES) * 100).toFixed(1);
    const { avgTurns, topMoves, faintSummary } = summarizeLogs(allLogs);

    console.log(`Results: Team A ${p1WinPct}% | Team B ${p2WinPct}% | Ties ${tiePct}%`);

    const analysis = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are a Pokémon battle analyst. After running ${NUM_BATTLES} simulated battles between two teams, here are the results:
Team A represents the user (the player) and Team B represents the opponent.

Team A: ${p1WinPct}% win rate
Team B: ${p2WinPct}% win rate
Ties: ${tiePct}%

Average battle length: ${avgTurns} turns
Most used moves across all ${NUM_BATTLES} battles: ${topMoves}

Pokémon faint frequency across all ${NUM_BATTLES} battles:
${faintSummary}

Team A composition:
${describeTeam(teamA)}

Team B composition:
${describeTeam(teamB)}

Here is one representative battle log to help ground your analysis. The log uses Pokémon Showdown protocol:
- |move|POKEMON|MOVE NAME| — a Pokémon used a move
- |damage|POKEMON|HP/MAXHP| — a Pokémon took damage
- |-heal|POKEMON|HP/MAXHP| — a Pokémon was healed
- |faint|POKEMON| — a Pokémon fainted
- |switch|POKEMON|DETAILS|HP| — a Pokémon switched in
- |win|PLAYER| — the winner of the battle

Representative battle log:
${lastLog}

Based on the win statistics, aggregate data, team compositions, and the battle log above, provide:
1. **Win Probability** — summarize the matchup odds
2. **Strengths** — what gives the winning team its edge, referencing specific moments from the log and aggregate data
3. **Weaknesses** — what holds the losing team back, referencing specific moments from the log and aggregate data
4. **Improvement suggestions** — specific move or Pokémon changes to Team A to improve its win rate

Only analyze based on the data provided. Do not invent move effects or stats not mentioned above.`
        }
      ]
    });

    return NextResponse.json({
      p1WinPct,
      p2WinPct,
      tiePct,
      p1Wins,
      p2Wins,
      ties,
      totalBattles: NUM_BATTLES,
      analysis: analysis.choices[0].message.content,
    });

  } catch (err) {
    console.error('Simulate error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
};