export const StatsStrip = () => {
  const stats = [
    ["100", "battles simulated per prediction"],
    ["6v6", "full competitive team format"],
    ["30", "canonical trainers to battle"],
  ];

  return (
    <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border border-y border-border mb-16 sm:mb-20">
      {stats.map(([value, label], i) => (
        <div key={i} className="flex-1 flex items-center gap-3 px-4 py-5">
          <span className="text-2xl font-bold font-mono tabular-nums text-accent">{value}</span>
          <span className="text-sm text-muted-light leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
};
