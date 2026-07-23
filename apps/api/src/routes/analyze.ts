import Router from "@koa/router";
import Groq from "groq-sdk";
import type { Context } from "koa";
import { buildAnalysisPrompt, type AnalyzeInput } from "../lib/buildAnalysisPrompt";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyzeRouter = new Router();

analyzeRouter.post("/analyze", async (ctx: Context) => {
  const input = ctx.request.body as Partial<AnalyzeInput>;

  if (!input.teamA?.length || !input.teamB?.length) {
    ctx.status = 400;
    ctx.body = { error: "Both teams must include at least one Pokémon" };
    return;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildAnalysisPrompt(input as AnalyzeInput) }],
    });

    ctx.body = { analysis: completion.choices[0].message.content };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: String(err) };
  }
});
