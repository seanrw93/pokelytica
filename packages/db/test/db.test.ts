import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

describe("db workspace harness", () => {
  it("connects to Postgres and can create/read/delete a User row", async () => {
    const id = randomUUID();

    await prisma.user.create({
      data: { id, email: `${id}@test.local`, name: "DB Harness User" },
    });

    const found = await prisma.user.findUnique({ where: { id } });
    expect(found?.id).toBe(id);

    await prisma.user.delete({ where: { id } });
  });
});
