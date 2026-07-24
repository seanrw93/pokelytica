"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "./motion";

export const Hero = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-8 pb-16 sm:pb-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5 sm:gap-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-2.5">
          <svg className="w-7 h-7" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="33" stroke="var(--border)" strokeWidth="2" fill="var(--surface)" />
            <path d="M3 36 A33 33 0 0 1 69 36 L36 36 Z" fill="var(--accent)" opacity="0.9" />
            <line x1="3" y1="36" x2="69" y2="36" stroke="var(--border)" strokeWidth="2" />
            <circle cx="36" cy="36" r="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          </svg>
          <span className="text-lg font-bold tracking-tight text-foreground">Pokélytica</span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
          Simulate the matchup before you build the team.
        </motion.h1>

        <motion.p variants={fadeUp} className="text-muted-light text-base leading-relaxed max-w-[52ch]">
          Build two Pokémon teams, run 100 simulated battles, and get an AI breakdown of why one side won.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mt-2">
          <Link
            href="/team-builder"
            className="bg-accent hover:bg-accent-hover active:scale-[0.98] transition text-background font-semibold px-6 py-3 rounded-full"
          >
            Build your team
          </Link>
          <Link href="/pricing" className="text-sm text-muted-light hover:text-foreground transition-colors">
            View pricing
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border rounded-lg p-5"
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Results</h2>
          <span className="text-xs font-mono tabular-nums text-muted uppercase tracking-wide">
            100 battles simulated
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Player
            </div>
            <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">64.0%</div>
            <div className="text-xs text-muted font-mono tabular-nums">64 wins</div>
          </div>
          <div className="space-y-0.5 text-right">
            <div className="flex items-center justify-end gap-2 text-sm font-medium text-negative">
              Opponent
              <span className="w-2 h-2 rounded-full bg-negative" />
            </div>
            <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">36.0%</div>
            <div className="text-xs text-muted font-mono tabular-nums">36 wins</div>
          </div>
        </div>

        <div className="flex rounded-full overflow-hidden h-2 mb-5">
          <div className="bg-accent" style={{ width: "64%" }} />
          <div className="bg-negative" style={{ width: "36%" }} />
        </div>

        <div className="border-t border-border pt-4 space-y-1.5">
          <div className="text-sm font-semibold text-foreground">Analysis</div>
          <p className="text-xs text-muted-light leading-relaxed">
            Your Garchomp swept 3 of 4 losses for the opponent by outspeeding their Rotom-Wash before it could Volt Switch out...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
