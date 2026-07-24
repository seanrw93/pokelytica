import Link from "next/link";
import { PiCheck } from "react-icons/pi";

const freeFeatures = [
  ["Team building", true],
  ["100-battle simulation", true],
  ["Battle a canonical trainer", true],
  ["AI analysis", "3 per day"],
] as const;

const premiumFeatures = [
  ["Team building", true],
  ["100-battle simulation", true],
  ["Battle a canonical trainer", true],
  ["AI analysis", "100 per week"],
] as const;

const FeatureRow = ({ label, value }: { label: string; value: true | string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-light">
    <PiCheck className="w-4 h-4 text-accent shrink-0" />
    <span>{label}{value !== true ? `: ${value}` : ""}</span>
  </div>
);

const PricingPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">Pricing</h1>
        <p className="text-muted-light max-w-[55ch] mx-auto">
          Team building and simulation are free and unlimited for everyone. The only thing that's metered is AI analysis,
          since that's the part that costs us to run.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-surface p-6 flex flex-col">
          <div className="mb-5">
            <div className="text-sm font-semibold text-foreground mb-1">Free</div>
            <div className="text-3xl font-bold font-mono tabular-nums text-foreground">$0</div>
          </div>

          <div className="space-y-2.5 mb-6 flex-1">
            {freeFeatures.map(([label, value]) => (
              <FeatureRow key={label} label={label} value={value} />
            ))}
          </div>

          <Link
            href="/team-builder"
            className="mt-auto text-center bg-surface-raised border border-border hover:border-accent transition-colors text-foreground font-semibold px-4 py-2.5 rounded-md"
          >
            Start building
          </Link>
        </div>

        <div className="rounded-lg border border-accent bg-surface p-6 flex flex-col relative">
          <div className="absolute -top-3 left-6 text-[0.65rem] font-mono uppercase tracking-wide bg-accent text-background px-2 py-0.5 rounded-full">
            More AI analysis
          </div>

          <div className="mb-5">
            <div className="text-sm font-semibold text-foreground mb-1">Premium</div>
            <div className="text-3xl font-bold font-mono tabular-nums text-foreground">
              $5<span className="text-sm font-normal text-muted">/month</span>
            </div>
          </div>

          <div className="space-y-2.5 mb-6 flex-1">
            {premiumFeatures.map(([label, value]) => (
              <FeatureRow key={label} label={label} value={value} />
            ))}
          </div>

          <button
            type="button"
            disabled
            className="mt-auto text-center bg-surface-raised border border-border text-muted font-semibold px-4 py-2.5 rounded-md cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-muted mt-8">
        Sign in with Google, GitHub, or email to track your AI analysis usage.
      </p>
    </div>
  );
};

export default PricingPage;
