import { Hero } from "./components/landing/Hero";
import { StepsSection } from "./components/landing/StepsSection";
import { ProductHighlights } from "./components/landing/ProductHighlights";
import { StatsStrip } from "./components/landing/StatsStrip";
import { PricingTeaser } from "./components/landing/PricingTeaser";
import { BottomCTA } from "./components/landing/BottomCTA";
import { GitHubLink } from "./components/landing/GitHubLink";

export default function Home() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 sm:pb-20">
      <GitHubLink />

      <Hero />

      <StepsSection />
      <ProductHighlights />
      <StatsStrip />
      <PricingTeaser />
      <BottomCTA />
    </div>
  );
}
