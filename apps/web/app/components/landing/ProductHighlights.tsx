"use client";

import { motion } from "motion/react";
import { PiChartLineUp, PiShieldWarning, PiSparkle, PiUsersThree } from "react-icons/pi";
import { getSpriteUrl } from "@/app/utils/getSprite";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const ProductHighlights = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: 0.08 }}
      className="mb-16 sm:mb-20"
    >
      <motion.h2 variants={reveal} className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-6">
        What you actually learn
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          variants={reveal}
          className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-lg border border-border p-6 flex flex-col justify-end min-h-[220px]"
          style={{ background: "linear-gradient(160deg, var(--surface-raised), var(--surface))" }}
        >
          <PiChartLineUp className="absolute top-6 right-6 w-24 h-24 text-accent/10" />
          <div className="text-sm font-mono uppercase tracking-wide text-accent mb-2">Deterministic</div>
          <h3 className="text-lg font-semibold text-foreground mb-1.5">Battle engine, not guesswork</h3>
          <p className="text-sm text-muted-light leading-relaxed max-w-[40ch]">
            Every simulation follows the same competitive battle rules. Run it again and the odds hold.
          </p>
        </motion.div>

        <motion.div
          variants={reveal}
          className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-lg border border-border p-6 flex flex-col justify-end min-h-[220px]"
        >
          <img
            src={getSpriteUrl("gengar")}
            alt=""
            className="absolute -top-2 -right-2 w-32 h-32 opacity-15 object-contain"
          />
          <PiSparkle className="w-6 h-6 text-accent mb-2" />
          <h3 className="text-lg font-semibold text-foreground mb-1.5">AI explains the why</h3>
          <p className="text-sm text-muted-light leading-relaxed max-w-[40ch]">
            Not just who won. Which turns decided it, which moves carried the matchup, what to change next.
          </p>
        </motion.div>

        <motion.div variants={reveal} className="rounded-lg border border-border bg-surface p-5">
          <PiUsersThree className="w-5 h-5 text-accent mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Team synergy</h3>
          <p className="text-xs text-muted-light leading-relaxed">
            See offensive and defensive coverage gaps across your whole roster.
          </p>
        </motion.div>

        <motion.div variants={reveal} className="rounded-lg border border-border bg-surface p-5">
          <PiShieldWarning className="w-5 h-5 text-accent mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Counterplay detection</h3>
          <p className="text-xs text-muted-light leading-relaxed">
            Find the opposing Pokémon that consistently shut your strategy down.
          </p>
        </motion.div>

        <motion.div variants={reveal} className="md:col-span-2 rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">30 canonical trainers</h3>
          <p className="text-xs text-muted-light leading-relaxed">
            Battle accurate gym leader, Elite Four, and champion rosters from three generations, no setup needed.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
