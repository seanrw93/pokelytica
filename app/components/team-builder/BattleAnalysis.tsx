import ReactMarkdown from "react-markdown";

type AnalysisProps = {
    analysis: string | null;
}

export const BattleAnalysis = ({ analysis }: AnalysisProps) => {
  return (
    <div className="bg--surface p-4 rounded-xl border border-border">
        <h2 className="text-xl font-semibold text-white mb-2">Analysis</h2>
        <div className="text-muted-light whitespace-pre-wrap">
            <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
    </div>
  )
}