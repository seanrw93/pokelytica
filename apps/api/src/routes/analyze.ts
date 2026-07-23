import { PrismaClient } from "@pokelytica/db";
import Router from "@koa/router";
import Groq from "groq-sdk";
import type { Context } from "koa";
import { buildAnalysisPrompt, type AnalyzeInput } from "../lib/buildAnalysisPrompt";
import { requireInternalSecret } from "../middleware/requireInternalSecret";
import { checkAndPrepareQuota } from "../lib/quota";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const prisma = new PrismaClient();

export const analyzeRouter = new Router();
analyzeRouter.use(requireInternalSecret);

analyzeRouter.post("/analyze", async (ctx: Context) => {
  const userId = ctx.get("x-user-id");

  if (!userId) {
    ctx.status = 400;
    ctx.body = { error: "Missing user" };
    return;
  }

  const input = ctx.request.body as Partial<AnalyzeInput>;

  if (!input.teamA?.length || !input.teamB?.length) {
    ctx.status = 400;
    ctx.body = { error: "Both teams must include at least one Pokémon" };
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  const quota = await checkAndPrepareQuota(prisma, userId, user.tier);

  if (!quota.allowed) {
    ctx.status = 429;
    ctx.body = { error: quota.message };
    return;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildAnalysisPrompt(input as AnalyzeInput) }],
    });

    await quota.increment();

    ctx.body = { analysis: completion.choices[0].message.content };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: String(err) };
  }
});
