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
        <div className="bg-surface p-4 rounded-lg border border-border">
            <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Results</h2>
                <span className="text-xs font-mono tabular-nums text-muted uppercase tracking-wide">
                    {totalBattles} battles simulated
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-accent">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        Player
                    </div>
                    <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">{p1WinPct}%</div>
                    <div className="text-xs text-muted font-mono tabular-nums">{p1Wins} wins</div>
                </div>

                <div className="space-y-0.5 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm font-medium text-negative">
                        Opponent
                        <span className="w-2 h-2 rounded-full bg-negative" />
                    </div>
                    <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">{p2WinPct}%</div>
                    <div className="text-xs text-muted font-mono tabular-nums">{p2Wins} wins</div>
                </div>
            </div>

            <div className="flex rounded-full overflow-hidden h-2">
                <div
                    className="bg-accent transition-all duration-500"
                    style={{ width: `${p1WinPct}%` }}
                />
                <div
                    className="bg-negative transition-all duration-500"
                    style={{ width: `${p2WinPct}%` }}
                />
            </div>

            {ties !== null && ties > 0 && (
                <div className="mt-2 text-xs text-muted font-mono tabular-nums text-center">
                    {ties} ties
                </div>
            )}
        </div>
    )
}
