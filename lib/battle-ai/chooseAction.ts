import { evaluateMatchup, evaluateSwitches } from "./evaluateSwitch";
import { projectWorstCaseIncoming } from "./projection";
import { effectiveSpeed, scoreMoves, type ScoredMove } from "./scoreActions";
import type { BattleSnapshot } from "./state";

export type ChosenAction =
  | { kind: "move"; name: string; score: number; why: string }
  | { kind: "switch"; species: string; benchIndex: number; score: number; why: string };

// Proactive switching is deliberately conservative: staying in and attacking
// is the default, and a switch has to clearly beat it.
const NO_GOOD_MOVE = 0.25;
const CLEARLY_BETTER_MARGIN = 0.75;

/** Pick a replacement after a faint (or any forced switch). */
export const chooseForcedSwitch = (snapshot: BattleSnapshot): ChosenAction | null => {
  const ranked = evaluateSwitches(snapshot.self.bench, snapshot.foe.active);
  if (ranked.length === 0) return null;
  const best = ranked[0];
  return {
    kind: "switch",
    species: best.species,
    benchIndex: best.benchIndex,
    score: best.score,
    why: "forced switch: best matchup on the bench",
  };
};

/**
 * The engine's single entry point for a normal turn: score every move and
 * weigh a proactive switch, then take the best action overall.
 */
export const chooseAction = (snapshot: BattleSnapshot): ChosenAction => {
  const { self, foe } = snapshot;
  const incoming = projectWorstCaseIncoming(foe.active, self.active);
  const moves = scoreMoves(snapshot, incoming);

  const bestMove: ScoredMove | null = moves.reduce<ScoredMove | null>(
    (best, m) => (best === null || m.score > best.score ? m : best),
    null
  );

  // Staying in is doomed when the foe outspeeds us and their best move KOs,
  // and we can't KO them first — our own move scores don't see that danger,
  // so it gets factored here.
  const foeActsFirst = effectiveSpeed(foe.active) > effectiveSpeed(self.active);
  const weKOFirst = bestMove?.koBeforeFoeActs ?? false;
  const doomed = incoming.wouldKO && foeActsFirst && !weKOFirst;

  const noGoodMove = bestMove === null || bestMove.score < NO_GOOD_MOVE;
  if ((noGoodMove || doomed) && self.bench.length > 0) {
    const stayingMatchup = evaluateMatchup(self.active, foe.active);
    const ranked = evaluateSwitches(self.bench, foe.active);
    const bestSwitch = ranked[0];
    if (bestSwitch && bestSwitch.score > stayingMatchup + CLEARLY_BETTER_MARGIN) {
      return {
        kind: "switch",
        species: bestSwitch.species,
        benchIndex: bestSwitch.benchIndex,
        score: bestSwitch.score,
        why: doomed ? "bad matchup: foe KOs first, better answer on the bench" : "no good action here, better answer on the bench",
      };
    }
  }

  if (bestMove === null) {
    // No moves at all (Struggle territory) — the adapter falls back to move 1.
    return { kind: "move", name: "", score: 0, why: "no usable moves" };
  }

  return { kind: "move", name: bestMove.name, score: bestMove.score, why: bestMove.why };
};
