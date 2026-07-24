import Router from "@koa/router";
import type { Context } from "koa";
import { runBattles, type PokemonSlot } from "../lib/battleSim";
import { requireInternalSecret } from "../middleware/requireInternalSecret";
import { validateTeam } from "../lib/validateTeam";

export const simulateRouter = new Router();
simulateRouter.use(requireInternalSecret);

simulateRouter.post("/simulate", async (ctx: Context) => {
  const { teamA, teamB } = ctx.request.body as { teamA?: PokemonSlot[]; teamB?: PokemonSlot[] };

  const validA = (teamA ?? []).filter(Boolean);
  const validB = (teamB ?? []).filter(Boolean);

  if (!validA.length || !validB.length) {
    ctx.status = 400;
    ctx.body = { error: "Both teams must include at least one Pokémon" };
    return;
  }

  const validationErrors = [...validateTeam(validA, "Team A"), ...validateTeam(validB, "Team B")];

  if (validationErrors.length) {
    ctx.status = 422;
    ctx.body = {
      error: "One or more Pokémon are incomplete",
      details: validationErrors.map((e) => e.message),
    };
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
