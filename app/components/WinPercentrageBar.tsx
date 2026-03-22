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
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Results ({totalBattles} battles)</h2>
            <div className="flex rounded-full overflow-hidden h-8 mb-2">
                <div
                    className="bg-blue-600 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${p1WinPct}%` }}
                >
                {p1WinPct}%
                </div>
                <div
                    className="bg-red-600 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${p2WinPct}%` }}
                >
                {p2WinPct}%
                </div>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
                <span>🔵 Team A — {p1Wins} wins</span>
                <span>Ties — {ties}</span>
                <span>{p2Wins} wins — Team B 🔴</span>
            </div>
        </div>
    )
}