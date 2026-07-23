import { PrismaClient } from "@pokelytica/db";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { mockCreateCompletion } from "./mockGroq";

const prisma = new PrismaClient();
const app = createApp();

const INTERNAL_SECRET = "test-internal-secret";

const validAnalyzeBody = () => ({
  teamA: [
    { species: "Pikachu", item: "", ability: "Static", nature: "Jolly", level: 50, evs: {}, ivs: {}, moves: [{ name: "Thunderbolt" }] },
  ],
  teamB: [
    { species: "Charizard", item: "", ability: "Blaze", nature: "Timid", level: 50, evs: {}, ivs: {}, moves: [{ name: "Flamethrower" }] },
  ],
  p1WinPct: "50.0",
  p2WinPct: "50.0",
  tiePct: "0.0",
  avgTurns: "10.0",
  topMoves: "Thunderbolt (5x)",
  faintSummary: "Pikachu fainted 1/1 battles",
  lastLog: "|win|Team A",
});

const createUser = async (tier: "FREE" | "PREMIUM") => {
  const id = randomUUID();
  await prisma.user.create({ data: { id, email: `${id}@test.local`, name: "Test User", tier } });
  return id;
};

const cleanupUser = async (userId: string) => {
  await prisma.usage.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
};

describe("POST /analyze quota gating", () => {
  beforeEach(() => {
    mockCreateCompletion.mockClear();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 429 and never calls Groq when a free-tier user is already at their daily limit", async () => {
    const userId = await createUser("FREE");
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    await prisma.usage.create({
      data: { userId, aiCallsToday: 3, dayResetAt: startOfToday, weekResetAt: startOfToday },
    });

    const res = await request(app.callback())
      .post("/analyze")
      .set("x-internal-api-secret", INTERNAL_SECRET)
      .set("x-user-id", userId)
      .send(validAnalyzeBody());

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/limit/i);
    expect(mockCreateCompletion).not.toHaveBeenCalled();

    await cleanupUser(userId);
  });

  it("increments a premium user's weekly counter correctly across multiple calls", async () => {
    const userId = await createUser("PREMIUM");

    for (let call = 1; call <= 3; call++) {
      const res = await request(app.callback())
        .post("/analyze")
        .set("x-internal-api-secret", INTERNAL_SECRET)
        .set("x-user-id", userId)
        .send(validAnalyzeBody());

      expect(res.status).toBe(200);

      const usage = await prisma.usage.findUnique({ where: { userId } });
      expect(usage?.aiCallsWeek).toBe(call);
      // Premium is gated on the weekly counter only — the daily counter is
      // never touched for this tier.
      expect(usage?.aiCallsToday).toBe(0);
    }

    expect(mockCreateCompletion).toHaveBeenCalledTimes(3);

    await cleanupUser(userId);
  });
});
