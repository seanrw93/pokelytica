import { Hero } from "./components/landing/Hero";
import { StepsSection } from "./components/landing/StepsSection";
import { FeaturesGrid } from "./components/landing/FeaturesGrid";
import { StatsRow } from "./components/landing/StatsRow";
import { BottomCTA } from "./components/landing/BottomCTA";
import { GitHubLink } from "./components/landing/GitHubLink";
import { InsightsSection } from "./components/landing/InsightSection";

export default function Home() {
  return (
    <>
      <div className="relative z-10 max-w-225 mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20">

        <GitHubLink />

        <Hero />

        <div className="w-full h-px bg-[#2e2e50] mb-10 sm:mb-12" />

        <StepsSection />
        <InsightsSection />
        <FeaturesGrid />
        <StatsRow />
        <BottomCTA />
      </div>
    </>
  );
}