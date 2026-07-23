import { describe, expect, it } from "vitest";
import { resetUsageIfStale, type UsageCounters } from "../src/lib/usageReset";

// Reference week: Monday 2026-01-12 through Sunday 2026-01-18 (UTC).
describe("resetUsageIfStale", () => {
  it("does not reset just before midnight (same day, same week)", () => {
    const usage: UsageCounters = {
      aiCallsToday: 2,
      aiCallsWeek: 10,
      dayResetAt: new Date("2026-01-15T00:00:00.000Z"),
      weekResetAt: new Date("2026-01-12T00:00:00.000Z"),
    };
    const now = new Date("2026-01-15T23:59:59.000Z");

    const result = resetUsageIfStale(usage, now);

    expect(result.aiCallsToday).toBe(2);
    expect(result.dayResetAt).toEqual(new Date("2026-01-15T00:00:00.000Z"));
    expect(result.aiCallsWeek).toBe(10);
    expect(result.weekResetAt).toEqual(new Date("2026-01-12T00:00:00.000Z"));
  });

  it("resets the day counter just after midnight, leaves the week counter alone", () => {
    const usage: UsageCounters = {
      aiCallsToday: 3,
      aiCallsWeek: 10,
      dayResetAt: new Date("2026-01-15T00:00:00.000Z"),
      weekResetAt: new Date("2026-01-12T00:00:00.000Z"),
    };
    const now = new Date("2026-01-16T00:00:01.000Z");

    const result = resetUsageIfStale(usage, now);

    expect(result.aiCallsToday).toBe(0);
    expect(result.dayResetAt).toEqual(new Date("2026-01-16T00:00:00.000Z"));
    expect(result.aiCallsWeek).toBe(10);
    expect(result.weekResetAt).toEqual(new Date("2026-01-12T00:00:00.000Z"));
  });

  it("does not reset mid-week", () => {
    const usage: UsageCounters = {
      aiCallsToday: 1,
      aiCallsWeek: 42,
      dayResetAt: new Date("2026-01-14T00:00:00.000Z"),
      weekResetAt: new Date("2026-01-12T00:00:00.000Z"),
    };
    const now = new Date("2026-01-14T12:00:00.000Z");

    const result = resetUsageIfStale(usage, now);

    expect(result.aiCallsToday).toBe(1);
    expect(result.aiCallsWeek).toBe(42);
    expect(result.weekResetAt).toEqual(new Date("2026-01-12T00:00:00.000Z"));
  });

  it("resets both counters exactly at the Monday-midnight day+week boundary", () => {
    const usage: UsageCounters = {
      aiCallsToday: 3,
      aiCallsWeek: 99,
      dayResetAt: new Date("2026-01-18T00:00:00.000Z"),
      weekResetAt: new Date("2026-01-12T00:00:00.000Z"),
    };
    const now = new Date("2026-01-19T00:00:00.000Z"); // next Monday, exact midnight

    const result = resetUsageIfStale(usage, now);

    expect(result.aiCallsToday).toBe(0);
    expect(result.dayResetAt).toEqual(new Date("2026-01-19T00:00:00.000Z"));
    expect(result.aiCallsWeek).toBe(0);
    expect(result.weekResetAt).toEqual(new Date("2026-01-19T00:00:00.000Z"));
  });
});
