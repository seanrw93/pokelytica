import type { StatTable } from "./state";

// Tracks the publicly-visible battle state a player is allowed to know, by
// observing protocol lines from its own player stream: the foe's active
// Pokémon, everyone's HP fractions/statuses/boosts, hazards on both sides,
// and the turn count. The request JSON only ever contains our own side, so
// everything about the opponent has to come from here.

export type TrackedMon = {
  species: string;
  level: number;
  hpFraction: number;
  status: string;
  fainted: boolean;
};

type SideId = "p1" | "p2";

const otherSide = (side: SideId): SideId => (side === "p1" ? "p2" : "p1");

const toId = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** "63/100 par" -> {fraction: 0.63, status: 'par'}; "0 fnt" -> fainted. */
export const parseCondition = (
  condition: string
): { hpFraction: number; status: string; fainted: boolean } => {
  const [hpPart, statusPart] = condition.split(" ");
  if (statusPart === "fnt" || hpPart === "0") {
    return { hpFraction: 0, status: "", fainted: true };
  }
  const [cur, max] = hpPart.split("/").map(Number);
  const hpFraction = Number.isFinite(cur) && Number.isFinite(max) && max > 0 ? cur / max : 1;
  return { hpFraction, status: statusPart ?? "", fainted: false };
};

/** "Garchomp, L50, M" -> {species: 'Garchomp', level: 50}. */
export const parseDetails = (details: string): { species: string; level: number } => {
  const parts = details.split(",").map((p) => p.trim());
  const levelPart = parts.find((p) => /^L\d+$/.test(p));
  return { species: parts[0], level: levelPart ? Number(levelPart.slice(1)) : 100 };
};

export class BattleTracker {
  turn = 1;
  private mySide: SideId | null = null;

  /** Per-side: species -> tracked public state. */
  private mons: Record<SideId, Map<string, TrackedMon>> = { p1: new Map(), p2: new Map() };
  /** Per-side: currently active species. */
  private actives: Record<SideId, string | null> = { p1: null, p2: null };
  /** Per-side: the ACTIVE Pokémon's stat stages (reset on switch). */
  private boosts: Record<SideId, StatTable> = { p1: {}, p2: {} };
  /** Per-side: hazard/side-condition layers. */
  private sides: Record<SideId, Record<string, number>> = { p1: {}, p2: {} };

  setMySide(side: SideId) {
    this.mySide = side;
  }

  get foeSide(): SideId {
    if (!this.mySide) throw new Error("BattleTracker: side not set yet");
    return otherSide(this.mySide);
  }

  foeActive(): TrackedMon | null {
    const species = this.actives[this.foeSide];
    return species ? this.mons[this.foeSide].get(species) ?? null : null;
  }

  foeBoosts(): StatTable {
    return this.boosts[this.foeSide];
  }

  myBoosts(): StatTable {
    if (!this.mySide) return {};
    return this.boosts[this.mySide];
  }

  foeTeam(): TrackedMon[] {
    return [...this.mons[this.foeSide].values()];
  }

  foeSideConditions(): Record<string, number> {
    return this.sides[this.foeSide];
  }

  mySideConditions(): Record<string, number> {
    return this.mySide ? this.sides[this.mySide] : {};
  }

  /** Which side a positional ident like "p2a: Garchomp" belongs to. */
  private static sideOf(ident: string): SideId {
    return ident.startsWith("p2") ? "p2" : "p1";
  }

  private upsert(side: SideId, species: string, patch: Partial<TrackedMon>): TrackedMon {
    const existing = this.mons[side].get(species) ?? {
      species,
      level: 100,
      hpFraction: 1,
      status: "",
      fainted: false,
    };
    const updated = { ...existing, ...patch };
    this.mons[side].set(species, updated);
    return updated;
  }

  observe(line: string): void {
    if (!line.startsWith("|")) return;
    const parts = line.split("|");
    const cmd = parts[1];

    switch (cmd) {
      case "turn":
        this.turn = Number(parts[2]) || this.turn;
        break;

      case "switch":
      case "drag": {
        const side = BattleTracker.sideOf(parts[2]);
        const { species, level } = parseDetails(parts[3]);
        const cond = parseCondition(parts[4] ?? "100/100");
        this.upsert(side, species, { level, ...cond });
        this.actives[side] = species;
        // Stat stages don't follow a Pokémon out.
        this.boosts[side] = {};
        break;
      }

      case "-damage":
      case "-heal":
      case "-sethp": {
        const side = BattleTracker.sideOf(parts[2]);
        const species = this.actives[side];
        if (species) this.upsert(side, species, parseCondition(parts[3]));
        break;
      }

      case "faint": {
        const side = BattleTracker.sideOf(parts[2]);
        const species = this.actives[side];
        if (species) this.upsert(side, species, { hpFraction: 0, fainted: true });
        break;
      }

      case "-status": {
        const side = BattleTracker.sideOf(parts[2]);
        const species = this.actives[side];
        if (species) this.upsert(side, species, { status: parts[3] });
        break;
      }

      case "-curestatus": {
        const side = BattleTracker.sideOf(parts[2]);
        const species = this.actives[side];
        if (species) this.upsert(side, species, { status: "" });
        break;
      }

      case "-boost":
      case "-unboost": {
        const side = BattleTracker.sideOf(parts[2]);
        const stat = parts[3] as keyof StatTable;
        const amount = Number(parts[4]) * (cmd === "-unboost" ? -1 : 1);
        const current = this.boosts[side][stat] ?? 0;
        this.boosts[side][stat] = Math.max(-6, Math.min(6, current + amount));
        break;
      }

      case "-clearboost":
      case "-clearnegativeboost": {
        const side = BattleTracker.sideOf(parts[2]);
        this.boosts[side] = {};
        break;
      }

      case "-clearallboost":
        this.boosts.p1 = {};
        this.boosts.p2 = {};
        break;

      case "-sidestart": {
        const side = parts[2].startsWith("p2") ? "p2" : "p1";
        const condition = toId(parts[3].replace(/^move:\s*/, ""));
        this.sides[side][condition] = (this.sides[side][condition] ?? 0) + 1;
        break;
      }

      case "-sideend": {
        const side = parts[2].startsWith("p2") ? "p2" : "p1";
        const condition = toId(parts[3].replace(/^move:\s*/, ""));
        delete this.sides[side][condition];
        break;
      }
    }
  }
}
