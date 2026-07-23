import Router from "@koa/router";
import type { Context } from "koa";
import { runBattles, type PokemonSlot } from "../lib/battleSim";

export const simulateRouter = new Router();

simulateRouter.post("/simulate", async (ctx: Context) => {
  const { teamA, teamB } = ctx.request.body as { teamA?: PokemonSlot[]; teamB?: PokemonSlot[] };

  const validA = (teamA ?? []).filter(Boolean);
  const validB = (teamB ?? []).filter(Boolean);

  if (!validA.length || !validB.length) {
    ctx.status = 400;
    ctx.body = { error: "Both teams must include at least one Pokémon" };
    return;
  }

  try {
    const result = await runBattles(validA, validB);
    ctx.body = result;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: String(err) };
  }
});
