import { describe, expect, it } from "vitest";
import { validateTeam } from "../src/lib/validateTeam";
import type { PokemonSlot } from "../src/lib/battleSim";

const mon = (overrides: Partial<PokemonSlot>): PokemonSlot => ({
  species: "Pikachu",
  item: "Light Ball",
  ability: "Static",
  nature: "Timid",
  level: 50,
  evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  moves: [{ name: "Thunderbolt" }],
  ...overrides,
});

describe("validateTeam", () => {
  it("passes a fully-formed team", () => {
    expect(validateTeam([mon({})], "Team A")).toEqual([]);
  });

  it("rejects a Pokémon with no species", () => {
    const errors = validateTeam([mon({ species: "" })], "Team A");

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/no species selected/);
  });

  it("rejects a Pokémon with zero moves selected", () => {
    const errors = validateTeam([mon({ moves: [] })], "Team A");

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/no moves selected/);
  });

  it("rejects a Pokémon whose move slots are all null", () => {
    const errors = validateTeam([mon({ moves: [null, null, null, null] })], "Team A");

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/no moves selected/);
  });

  it("accepts a Pokémon with just one real move among empty slots", () => {
    const errors = validateTeam([mon({ moves: [null, { name: "Thunderbolt" }, null, null] })], "Team A");

    expect(errors).toEqual([]);
  });

  it("reports every invalid slot, not just the first", () => {
    const team = [mon({ moves: [] }), mon({}), mon({ species: "" })];
    const errors = validateTeam(team, "Team B");

    expect(errors).toHaveLength(2);
    expect(errors[0].slot).toBe(0);
    expect(errors[1].slot).toBe(2);
  });
});
