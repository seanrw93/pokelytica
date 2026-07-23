export type UsageCounters = {
  aiCallsToday: number;
  aiCallsWeek: number;
  dayResetAt: Date;
  weekResetAt: Date;
};

// UTC midnight of the given date's day.
export const startOfUTCDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// UTC midnight of the most recent Monday at or before the given date (ISO week start).
export const startOfUTCWeek = (date: Date) => {
  const day = startOfUTCDay(date);
  const weekday = day.getUTCDay(); // 0 = Sunday ... 6 = Saturday
  const daysSinceMonday = (weekday + 6) % 7; // Monday -> 0, Sunday -> 6
  day.setUTCDate(day.getUTCDate() - daysSinceMonday);
  return day;
};

// Pure function: given the current usage counters and "now", returns what the
// counters should be — resetting a counter whenever its window has elapsed.
// Callers persist the result; this has no side effects, which is what makes
// the day/week boundary logic cheap to unit test.
export const resetUsageIfStale = (usage: UsageCounters, now: Date): UsageCounters => {
  const currentDayStart = startOfUTCDay(now);
  const currentWeekStart = startOfUTCWeek(now);

  const dayIsStale = usage.dayResetAt < currentDayStart;
  const weekIsStale = usage.weekResetAt < currentWeekStart;

  return {
    aiCallsToday: dayIsStale ? 0 : usage.aiCallsToday,
    dayResetAt: dayIsStale ? currentDayStart : usage.dayResetAt,
    aiCallsWeek: weekIsStale ? 0 : usage.aiCallsWeek,
    weekResetAt: weekIsStale ? currentWeekStart : usage.weekResetAt,
  };
};
