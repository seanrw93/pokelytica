type FeatureCardProps = {
    color: string,
    title: string,
    desc: string
}

export const FeatureCard = ({ color, title, desc }: FeatureCardProps) => {
  return (
    <div className="bg-[#1a1a2e] border border-[#2e2e50] rounded-xl p-4 sm:p-5 flex flex-col gap-2 hover:border-[#3d7dca] transition">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
      </div>

      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-[#7878a0] leading-relaxed">{desc}</div>
    </div>
  );
}