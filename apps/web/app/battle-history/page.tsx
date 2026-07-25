// TODO(battle-history): placeholder only. Nothing writes BattleRecord rows
// yet (schema.prisma has the model, but no route calls
// prisma.battleRecord.create), so there is no real history to list here.
// Replace this with the actual list once simulations start being persisted.
import Link from "next/link";

const BattleHistoryPage = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">Battle History</h1>
      <p className="text-muted-light max-w-[46ch] mx-auto mb-8">
        We don&apos;t save your past simulations yet — this is where they&apos;ll show up once we do.
      </p>
      <Link href="/team-builder" className="text-accent hover:underline text-sm font-semibold">
        Run a simulation →
      </Link>
    </div>
  );
};

export default BattleHistoryPage;
