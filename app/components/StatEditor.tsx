// components/StatEditor.tsx
import { Stats } from "@/lib/types";

type StatEditorProps = {
  label: string;
  stats: Stats;
  onChange: (updated: Stats) => void;
  min?: number;
  max?: number;
};

export const StatEditor = ({ label, stats, onChange, min = 0, max = 252 }: StatEditorProps) => {
  return (
    <div>
      <h4 className="text-sm text-gray-300 mb-2">{label}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {(Object.keys(stats) as (keyof Stats)[]).map(stat => (
          <div key={stat}>
            <label className="text-xs text-gray-400 uppercase">{stat}</label>
            <input
              type="number"
              min={min}
              max={max}
              value={stats[stat]}
              onChange={(e) => onChange({ ...stats, [stat]: Number(e.target.value) })}
              className="w-full p-1 rounded bg-gray-700 text-white text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};