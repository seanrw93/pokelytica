"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./motion";

export const Hero = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center mb-12 sm:mb-16 gap-5 sm:gap-6"
    >
      <motion.span variants={fadeUp} className="inline-block bg-[#222240] border border-[#2e2e50] text-[#7878a0] text-[0.65rem] sm:text-[0.7rem] tracking-widest uppercase px-3 py-1 rounded-full">
        Work in progress
      </motion.span>

      <motion.svg variants={fadeUp} className="w-14 h-14 sm:w-18 sm:h-18 animate-bounce" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="34" stroke="#2e2e50" strokeWidth="2" fill="#1a1a2e"/>
        <path d="M2 36 A34 34 0 0 1 70 36 L36 36 Z" fill="#e3350d" opacity="0.85"/>
        <path d="M2 36 A34 34 0 0 0 70 36 L36 36 Z" fill="none"/>
        <line x1="2" y1="36" x2="70" y2="36" stroke="#2e2e50" strokeWidth="2"/>
        <circle cx="36" cy="36" r="9" fill="#1a1a2e" stroke="#2e2e50" strokeWidth="2"/>
        <circle cx="36" cy="36" r="5" fill="#222240" stroke="#3d7dca" strokeWidth="1.5"/>
        <circle cx="36" cy="36" r="2" fill="#3d7dca"/>
      </motion.svg>

      <motion.h1 variants={fadeUp} className="text-[2.2rem] sm:text-[clamp(2.4rem,6vw,3.8rem)] font-bold font-pocket tracking-tight leading-none">
        <span className="text-[#e3350d]">Poké</span>
        <span className="text-[#ffcb05]">lytica</span>
      </motion.h1>

      <motion.div variants={fadeUp} className="mt-6">
        <Link
          href="/team-builder"
          className="w-full sm:w-auto text-center bg-[#e3350d] hover:bg-[#ff4520] active:scale-95 transition text-white font-semibold px-6 sm:px-9 py-3 rounded-lg"
        >
          Build your team →
        </Link>
      </motion.div>
    </motion.div>
  );
}