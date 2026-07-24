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
      <h4 className="text-sm text-muted-light mb-2">{label}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {(Object.keys(stats) as (keyof Stats)[]).map(stat => (
          <div key={stat}>
            <label className="text-xs text-muted uppercase tracking-wide">{stat}</label>
            <input
              type="number"
              min={min}
              max={max}
              value={stats[stat]}
              onChange={(e) => onChange({ ...stats, [stat]: Number(e.target.value) })}
              className="w-full p-1.5 rounded-md bg-surface-raised border border-border text-foreground text-sm font-mono tabular-nums focus:outline-none focus:border-accent transition-colors duration-150"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
