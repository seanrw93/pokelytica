import Link from "next/link";
import { PiCheck } from "react-icons/pi";

export const PricingTeaser = () => {
  return (
    <section className="mb-16 sm:mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="text-sm font-semibold text-foreground mb-1">Free</div>
          <div className="text-xs text-muted-light mb-3">Unlimited building, unlimited simulation.</div>
          <div className="flex items-center gap-2 text-xs text-muted-light">
            <PiCheck className="w-3.5 h-3.5 text-accent shrink-0" />
            3 AI analyses per day
          </div>
        </div>
        <div className="rounded-lg border border-accent bg-surface p-5">
          <div className="text-sm font-semibold text-foreground mb-1">Premium</div>
          <div className="text-xs text-muted-light mb-3">For running a lot of matchups.</div>
          <div className="flex items-center gap-2 text-xs text-muted-light">
            <PiCheck className="w-3.5 h-3.5 text-accent shrink-0" />
            100 AI analyses per week
          </div>
        </div>
      </div>
      <Link href="/pricing" className="text-sm text-accent hover:underline">
        See full pricing
      </Link>
    </section>
  );
};
