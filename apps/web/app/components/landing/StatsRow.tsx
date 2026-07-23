import { StatBox } from "./StatBox";

export const StatsRow = () => {
  const stats = [
    ["100", "battles simulated per prediction", "#e3350d"],
    ["6v6", "full competitive team format", "#ffcb05"],
    ["AI", "powered by Groq LLM", "#3d7dca"],
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12 sm:mb-14">
      {stats.map((s, i) => (
        <StatBox key={i} value={s[0]} label={s[1]} color={s[2]} />
      ))}
    </div>
  );
}