import { FeatureCard } from "./FeatureCard";

export const FeaturesGrid = () => {
    const features = [
        [
            "#e3350d",
            "Deterministic battle engine",
            "Simulations follow competitive battle rules with consistent, reproducible logic.",
        ],
        [
            "#ffcb05",
            "Team synergy analysis",
            "Evaluate how well your team works together across offense, defense, and coverage.",
        ],
        [
            "#3d7dca",
            "Win condition breakdown",
            "Understand exactly how victories happen — not just who wins.",
        ],
        [
            "#9b72fb",
            "Counterplay detection",
            "Identify opposing Pokémon that consistently shut down your strategy.",
        ],
    ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3 sm:gap-4 mb-12 sm:mb-14">
      {features.map((f, i) => (
        <FeatureCard key={i} color={f[0]} title={f[1]} desc={f[2]} />
      ))}
    </div>
  );
}