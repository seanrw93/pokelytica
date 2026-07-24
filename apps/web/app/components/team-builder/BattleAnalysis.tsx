import ReactMarkdown from "react-markdown";
import { PiSparkle } from "react-icons/pi";

type AnalysisProps = {
    analysis: string | null;
}

export const BattleAnalysis = ({ analysis }: AnalysisProps) => {
  return (
    <div className="bg-surface p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-foreground">Analysis</h2>
            <span className="flex items-center gap-1 text-xs text-muted font-mono uppercase tracking-wide">
                <PiSparkle className="w-3.5 h-3.5" />
                AI-generated
            </span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-light prose-strong:text-foreground prose-li:text-muted-light">
            <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
    </div>
  )
}
