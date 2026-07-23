import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("api workspace harness", () => {
  it("responds to GET /health", async () => {
    const app = createApp();
    const res = await request(app.callback()).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
