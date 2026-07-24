type WinPercentrageBarProps = {
    totalBattles: number | null;
    p1WinPct: string | null;
    p2WinPct: string | null;
    p1Wins: number | null;
    p2Wins: number | null;
    ties: number | null;
}

export const WinPercentrageBar = ({
    totalBattles,
    p1WinPct,
    p2WinPct,
    p1Wins,
    p2Wins,
    ties
}: WinPercentrageBarProps) => {
  return (
        <div className="bg-surface p-4 rounded-xl border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Results ({totalBattles} battles)</h2>
            <div className="flex rounded-full overflow-hidden h-8 mb-2">
                <div
                    className="bg-accent flex items-center justify-center text-background text-sm font-semibold transition-all duration-500"
                    style={{ width: `${p1WinPct}%` }}
                >
                {p1WinPct}%
                </div>
                <div
                    className="bg-negative flex items-center justify-center text-white text-sm font-semibold transition-all duration-500"
                    style={{ width: `${p2WinPct}%` }}
                >
                {p2WinPct}%
                </div>
            </div>
            <div className="flex justify-between text-sm text-muted">
                <span className="text-accent font-semibold">⚡ Player — {p1Wins} wins</span>
                <span>Ties — {ties}</span>
                <span className="text-negative font-semibold">{p2Wins} wins — Opponent 🔴</span>
            </div>
        </div>
    )
}