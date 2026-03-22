import ReactMarkdown from "react-markdown";

type AnalysisProps = {
    analysis: string | null;
}

export const BattleAnalysis = ({ analysis }: AnalysisProps) => {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-2">Analysis</h2>
        <div className="text-gray-300 whitespace-pre-wrap">
            <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
    </div>
  )
}