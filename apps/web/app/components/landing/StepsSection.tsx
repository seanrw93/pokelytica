"use client";

import { StepItem } from "./StepItem";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "./motion";

export const StepsSection = () => {
  const steps = [
    ["1", "Build your team", "Pick up to 6 Pokémon, assign moves, items, abilities & natures"],
    ["2", "Set the opponent", "Build a second team to face yours in battle"],
    ["3", "Simulate 100 battles", "The engine runs 100 match simulations and tallies results"],
    ["4", "Get AI analysis", "A Groq LLM interprets the results and explains why"],
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.p variants={fadeUp} className="text-center text-[0.65rem] sm:text-[0.72rem] tracking-[0.12em] uppercase text-[#7878a0] mb-5 sm:mb-6">
        How it works
      </motion.p>

      <div className="flex flex-col md:flex-row mb-12">
        {steps.map((step, i) => (
          <motion.div key={i} variants={fadeUp} className="flex-1">
            <StepItem {...{
              index: step[0],
              title: step[1],
              desc: step[2],
              isLast: i === steps.length - 1
            }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}