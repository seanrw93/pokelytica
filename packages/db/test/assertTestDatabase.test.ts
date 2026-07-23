import { describe, expect, it } from "vitest";
import { assertTestDatabaseUrl } from "./assertTestDatabase";

describe("assertTestDatabaseUrl", () => {
  it("allows the dedicated test container URL", () => {
    expect(() =>
      assertTestDatabaseUrl("postgresql://test:test@localhost:5433/pokelytica_test?schema=public"),
    ).not.toThrow();
  });

  it("allows 127.0.0.1 as an equivalent host", () => {
    expect(() =>
      assertTestDatabaseUrl("postgresql://test:test@127.0.0.1:5433/pokelytica_test"),
    ).not.toThrow();
  });

  it("rejects a missing DATABASE_URL", () => {
    expect(() => assertTestDatabaseUrl(undefined)).toThrow();
  });

  it("rejects the default Postgres port (likely a real local database)", () => {
    expect(() =>
      assertTestDatabaseUrl("postgresql://test:test@localhost:5432/pokelytica_test"),
    ).toThrow();
  });

  it("rejects a non-test database name", () => {
    expect(() =>
      assertTestDatabaseUrl("postgresql://test:test@localhost:5433/pokelytica"),
    ).toThrow();
  });

  it("rejects a non-local host", () => {
    expect(() =>
      assertTestDatabaseUrl("postgresql://test:test@prod-db.example.com:5433/pokelytica_test"),
    ).toThrow();
  });
});
