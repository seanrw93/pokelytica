import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const app = createApp();
const INTERNAL_SECRET = "test-internal-secret";

const validMon = () => ({
  species: "Pikachu",
  item: "Light Ball",
  ability: "Static",
  nature: "Timid",
  level: 50,
  evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  moves: [{ name: "Thunderbolt" }],
});

const moveslessMon = () => ({ ...validMon(), moves: [] });

describe("POST /simulate validation", () => {
  // This is the actual regression test: @pkmn/sim used to throw synchronously
  // while constructing a moveless Pokémon in a way that bypassed the route's
  // own try/catch and crashed the whole Koa process, not just this request.
  // If that regression comes back, this test hangs/crashes the whole suite
  // rather than failing cleanly — that's the point.
  it("returns 422 (not a crash) when a Pokémon has no moves selected", async () => {
    const res = await request(app.callback())
      .post("/simulate")
      .set("x-internal-api-secret", INTERNAL_SECRET)
      .send({ teamA: [moveslessMon()], teamB: [validMon()] });

    expect(res.status).toBe(422);
    expect(res.body.details.join(" ")).toMatch(/no moves selected/);
  });

  it("returns 422 when a Pokémon has no species selected", async () => {
    const res = await request(app.callback())
      .post("/simulate")
      .set("x-internal-api-secret", INTERNAL_SECRET)
      .send({ teamA: [{ ...validMon(), species: "" }], teamB: [validMon()] });

    expect(res.status).toBe(422);
    expect(res.body.details.join(" ")).toMatch(/no species selected/);
  });

  it("returns 400 when a team is entirely empty", async () => {
    const res = await request(app.callback())
      .post("/simulate")
      .set("x-internal-api-secret", INTERNAL_SECRET)
      .send({ teamA: [], teamB: [validMon()] });

    expect(res.status).toBe(400);
  });

  it("rejects requests without the internal secret", async () => {
    const res = await request(app.callback())
      .post("/simulate")
      .send({ teamA: [validMon()], teamB: [validMon()] });

    expect(res.status).toBe(401);
  });
});
