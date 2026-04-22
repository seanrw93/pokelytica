"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const InsightsSection = () => {
  const insights = [
    "Identify which Pokémon consistently underperform",
    "Understand losing matchups across 100 simulations",
    "See which opponents dominate your team composition",
    "Break down win conditions and turning points",
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-12 sm:mb-16"
    >
      <motion.p
        variants={fadeUp}
        className="text-center text-[0.65rem] sm:text-[0.72rem] tracking-[0.12em] uppercase text-[#7878a0] mb-6"
      >
        What you actually learn
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((text, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="bg-[#1a1a2e] border border-[#2e2e50] rounded-xl p-5 text-sm text-[#a0a0c0] text-center"
          >
            {text}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}