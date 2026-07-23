import { RandomPlayerAI } from '@pkmn/sim';
import { ObjectReadWriteStream } from '@pkmn/streams';
import { Generations } from '@pkmn/data';
import { Dex } from '@pkmn/dex';
import { calculate, Pokemon, Move } from '@smogon/calc';
import { AnyObject } from '@pkmn/sim';

const gens = new Generations(Dex);

export class HeuristicAI extends RandomPlayerAI {
  private gen = gens.get(9);

  constructor(stream: ObjectReadWriteStream<string>) {
    super(stream);
  }

  protected override chooseMove(request: AnyObject): string {
    if (!request.active?.[0]) return this.firstAvailableMove(request);

    const active = request.active[0];
    const activePokemon = request.side.pokemon[0];
    const opponent = request.side.pokemon[0];

    const hpPercent = activePokemon.hp / activePokemon.maxhp;
    if (hpPercent < 0.3) {
      const switchChoice = this.chooseSwitchTarget(request);
      if (switchChoice) return `switch ${switchChoice}`;
    }

    const availableMoves = active.moves
      .map((move: AnyObject, i: number) => ({ move, slot: i + 1 }))
      .filter(({ move }: { move: AnyObject }) => !move.disabled);

    if (availableMoves.length === 0) return this.firstAvailableMove(request);

    const moveScores = availableMoves
      .map(({ move, slot }: { move: AnyObject; slot: number }) => {
        try {
          const attackerPokemon = new Pokemon(this.gen, activePokemon.name, {
            level: activePokemon.level ?? 50,
            item: activePokemon.item,
            ability: activePokemon.ability,
          });
          const defenderPokemon = new Pokemon(this.gen, opponent.name, {
            level: opponent.level ?? 50,
            item: opponent.item,
            ability: opponent.ability,
          });
          const result = calculate(
            this.gen,
            attackerPokemon,
            defenderPokemon,
            new Move(this.gen, move.name)
          );
          const dmg = result.damage;
          const maxDamage = Array.isArray(dmg) ? Math.max(...(dmg as number[])) : 0;
          return {
            slot,
            score: maxDamage,
            willKO: maxDamage >= defenderPokemon.originalCurHP,
          };
        } catch {
          return { slot, score: 0, willKO: false };
        }
      });

    moveScores.sort((a: AnyObject, b: AnyObject) => {
      if (a.willKO && !b.willKO) return -1;
      if (!a.willKO && b.willKO) return 1;
      return b.score - a.score;
    });

    return `move ${moveScores[0].slot}`;
  }

  private firstAvailableMove(request: AnyObject): string {
    const active = request.active?.[0];
    if (!active) return 'move 1';
    const available = active.moves.findIndex((m: AnyObject) => !m.disabled);
    return available >= 0 ? `move ${available + 1}` : 'move 1';
  }

  private chooseSwitchTarget(request: AnyObject): number | null {
    const bench = request.side.pokemon.slice(1);
    const scored = bench
      .map((pokemon: AnyObject, i: number) => {
        if (pokemon.fainted) return null;
        return { slot: i + 2, score: pokemon.hp / pokemon.maxhp };
      })
      .filter(Boolean);

    scored.sort((a: AnyObject, b: AnyObject) => b.score - a.score);
    return scored[0]?.slot ?? null;
  }
}