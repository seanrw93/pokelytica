import type { PrismaClient, Tier } from "@pokelytica/db";
import { resetUsageIfStale } from "./usageReset";

const TIER_LIMITS = {
  FREE: { field: "aiCallsToday", max: 3, window: "daily" },
  PREMIUM: { field: "aiCallsWeek", max: 100, window: "weekly" },
} as const;

export type QuotaCheckResult =
  | { allowed: true; increment: () => Promise<void> }
  | { allowed: false; message: string };

export const checkAndPrepareQuota = async (
  prisma: PrismaClient,
  userId: string,
  tier: Tier,
  now = new Date(),
): Promise<QuotaCheckResult> => {
  const existing = await prisma.usage.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const reset = resetUsageIfStale(existing, now);
  const usage = await prisma.usage.update({ where: { userId }, data: reset });

  const limit = TIER_LIMITS[tier];
  const current = usage[limit.field];

  if (current >= limit.max) {
    return {
      allowed: false,
      message: `You've hit your ${limit.window} AI analysis limit (${limit.max}). ${
        tier === "FREE" ? "Upgrade to premium for more, or try again tomorrow." : "Try again next week."
      }`,
    };
  }

  return {
    allowed: true,
    increment: async () => {
      await prisma.usage.update({
        where: { userId },
        data: { [limit.field]: { increment: 1 } },
      });
    },
  };
};
