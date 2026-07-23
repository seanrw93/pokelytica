import { describe, expect, it } from "vitest";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

describe("db workspace harness", () => {
  it("connects to Postgres and queries the User table", async () => {
    const count = await prisma.user.count();
    expect(count).toBe(0);
  });
});
