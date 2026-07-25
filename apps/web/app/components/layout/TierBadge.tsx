type Tier = "FREE" | "PREMIUM";

export const getTier = (user: { tier?: string | null }): Tier =>
  user.tier === "PREMIUM" ? "PREMIUM" : "FREE";

export const TierBadge = ({ tier }: { tier: Tier }) => (
  <span
    className={
      "text-[0.6rem] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-full border shrink-0 " +
      (tier === "PREMIUM"
        ? "bg-accent/15 text-accent border-accent/30"
        : "bg-surface-raised text-muted-light border-border")
    }
  >
    {tier}
  </span>
);
