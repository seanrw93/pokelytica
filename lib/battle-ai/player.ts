import { RandomPlayerAI } from "@pkmn/sim";
import type { ObjectReadWriteStream } from "@pkmn/streams";
import { chooseAction, chooseForcedSwitch } from "./chooseAction";
import { BattleTracker, parseCondition, parseDetails, type TrackedMon } from "./tracker";
import type { PokemonState, StatTable } from "./state";

// The shape both teams already flow through the simulate route in
// (toShowdownSet output).
export type TeamSpec = {
  species: string;
  name?: string;
  item?: string;
  ability?: string;
  moves?: string[];
  nature?: string;
  evs?: StatTable;
  ivs?: StatTable;
  level?: number;
};

// Structural view of the request union (@pkmn/sim doesn't re-export
// ChoiceRequest from its entry point); the fields below are verified against
// build/cjs/sim/side.d.ts.
type AnyRequest = {
  wait?: boolean;
  teamPreview?: boolean;
  forceSwitch?: boolean[];
  active?: {
    moves: { move: string; id: string; disabled?: string | boolean }[];
    trapped?: boolean;
  }[];
  side?: {
    id: string;
    pokemon: {
      ident: string;
      details: string;
      condition: string;
      active: boolean;
    }[];
  };
};

type BaseRequest = Parameters<RandomPlayerAI["receiveRequest"]>[0];

const toId = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * BattleStream player driven by the heuristic decision engine. Knows both
 * team sheets (the simulator is ours and both sides are ours, so playing
 * omniscient is fair and lets the projection use the foe's real moveset);
 * live HP/status/boosts/hazards come from tracking the protocol stream,
 * since requests only ever describe our own side.
 *
 * Extends RandomPlayerAI so anything the engine can't handle (team preview,
 * revives, errors mid-decision) falls back to a legal random choice instead
 * of stalling the battle.
 */
export class HeuristicPlayerAI extends RandomPlayerAI {
  private tracker = new BattleTracker();
  private team: TeamSpec[];
  private opponentTeam: TeamSpec[];

  constructor(
    playerStream: ObjectReadWriteStream<string>,
    teams: { team: TeamSpec[]; opponentTeam: TeamSpec[] }
  ) {
    super(playerStream);
    this.team = teams.team;
    this.opponentTeam = teams.opponentTeam;
  }

  override receiveLine(line: string): void {
    this.tracker.observe(line);
    super.receiveLine(line);
  }

  override receiveRequest(baseRequest: BaseRequest): void {
    const request = baseRequest as AnyRequest;
    try {
      const sideId = request.side?.id;
      if (sideId === "p1" || sideId === "p2") this.tracker.setMySide(sideId);
      if (request.wait) return;

      if (request.forceSwitch?.[0] && request.side) {
        const choice = this.decideForcedSwitch(request);
        if (choice) return this.choose(choice);
      } else if (request.active?.[0] && request.side) {
        const choice = this.decideTurn(request);
        if (choice) return this.choose(choice);
      }
    } catch {
      // Never let a decision bug stall or crash the battle.
    }
    super.receiveRequest(baseRequest);
  }

  private decideForcedSwitch(request: AnyRequest): string | null {
    const { bench, slots } = this.buildBench(request);
    if (bench.length === 0) return null;

    const snapshot = {
      turn: this.tracker.turn,
      self: { active: bench[0], bench, sideConditions: this.tracker.mySideConditions() },
      foe: this.buildFoeSide(),
    };
    const action = chooseForcedSwitch(snapshot);
    if (!action || action.kind !== "switch") return null;
    return `switch ${slots[action.benchIndex]}`;
  }

  private decideTurn(request: AnyRequest): string | null {
    const active = request.active![0];
    const requestMoves = active.moves.filter((m) => !m.disabled);
    if (requestMoves.length === 0) return null;

    const self = this.buildSelfActive(request, requestMoves.map((m) => m.move));
    if (!self) return null;

    // A trapped Pokémon gets an empty bench so the engine can't pick a switch.
    const { bench, slots } = active.trapped ? { bench: [], slots: [] } : this.buildBench(request);

    const snapshot = {
      turn: this.tracker.turn,
      self: { active: self, bench, sideConditions: this.tracker.mySideConditions() },
      foe: this.buildFoeSide(),
    };

    const action = chooseAction(snapshot);
    if (action.kind === "switch") return `switch ${slots[action.benchIndex]}`;

    // Choice slots are indexed against the full move list, disabled included.
    const slot = active.moves.findIndex((m) => !m.disabled && toId(m.move) === toId(action.name));
    if (slot === -1) return null;
    return `move ${slot + 1}`;
  }

  private specFor(team: TeamSpec[], species: string): TeamSpec | undefined {
    return team.find((s) => toId(s.species) === toId(species));
  }

  private toState(
    spec: TeamSpec | undefined,
    tracked: Pick<TrackedMon, "species" | "level" | "hpFraction" | "status">,
    boosts: StatTable,
    moves?: string[]
  ): PokemonState {
    return {
      species: spec?.species ?? tracked.species,
      level: spec?.level ?? tracked.level,
      item: spec?.item,
      ability: spec?.ability,
      nature: spec?.nature,
      evs: spec?.evs,
      ivs: spec?.ivs,
      moves: moves ?? spec?.moves ?? [],
      hpFraction: tracked.hpFraction,
      status: tracked.status,
      boosts,
    };
  }

  private buildSelfActive(request: AnyRequest, enabledMoves: string[]): PokemonState | null {
    const entry = request.side!.pokemon.find((p) => p.active);
    if (!entry) return null;
    const { species, level } = parseDetails(entry.details);
    const cond = parseCondition(entry.condition);
    const spec = this.specFor(this.team, species);
    return this.toState(
      spec,
      { species, level, hpFraction: cond.hpFraction, status: cond.status },
      this.tracker.myBoosts(),
      enabledMoves
    );
  }

  /** Healthy bench + their 1-based request slots for `switch N` choices. */
  private buildBench(request: AnyRequest): { bench: PokemonState[]; slots: number[] } {
    const bench: PokemonState[] = [];
    const slots: number[] = [];
    request.side!.pokemon.forEach((p, i) => {
      if (p.active) return;
      const cond = parseCondition(p.condition);
      if (cond.fainted) return;
      const { species, level } = parseDetails(p.details);
      const spec = this.specFor(this.team, species);
      bench.push(
        this.toState(spec, { species, level, hpFraction: cond.hpFraction, status: cond.status }, {})
      );
      slots.push(i + 1);
    });
    return { bench, slots };
  }

  private buildFoeSide(): { active: PokemonState; bench: PokemonState[]; sideConditions: Record<string, number> } {
    const tracked = this.tracker.foeActive();
    const activeSpecies = tracked?.species ?? this.opponentTeam[0]?.species ?? "Ditto";
    const activeSpec = this.specFor(this.opponentTeam, activeSpecies);
    const active = this.toState(
      activeSpec,
      tracked ?? { species: activeSpecies, level: activeSpec?.level ?? 100, hpFraction: 1, status: "" },
      this.tracker.foeBoosts()
    );

    const seen = new Map(this.tracker.foeTeam().map((m) => [toId(m.species), m]));
    const bench = this.opponentTeam
      .filter((spec) => toId(spec.species) !== toId(activeSpecies))
      .filter((spec) => !(seen.get(toId(spec.species))?.fainted ?? false))
      .map((spec) => {
        const m = seen.get(toId(spec.species));
        return this.toState(
          spec,
          m ?? { species: spec.species, level: spec.level ?? 100, hpFraction: 1, status: "" },
          {}
        );
      });

    return { active, bench, sideConditions: this.tracker.foeSideConditions() };
  }
}
