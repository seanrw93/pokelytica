import Link from "next/link";

export const BottomCTA = () => {
  return (
    <div className="flex flex-col items-center gap-3 text-center border-t border-border pt-12">
      <Link
        href="/team-builder"
        className="w-full sm:w-auto text-center bg-accent hover:bg-accent-hover active:scale-[0.98] transition text-background font-semibold px-6 sm:px-9 py-3 rounded-full"
      >
        Build your team
      </Link>
      <p className="text-xs text-muted px-4">
        No account needed. Sign in only when you want AI analysis.
      </p>
    </div>
  );
}
