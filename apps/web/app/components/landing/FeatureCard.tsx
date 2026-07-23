type FeatureCardProps = {
    sprite: string,
    title: string,
    desc: string
}

export const FeatureCard = ({ sprite, title, desc }: FeatureCardProps) => {
  return (
    <div className="bg-[#1a1a2e] border border-[#2e2e50] rounded-xl p-4 sm:p-5 flex flex-col text-center gap-2 hover:border-[#3d7dca] transition">
      <div className="w-12 h-12 rounded-lg mx-auto">
        <img
          src={sprite}
          alt={title}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-[#7878a0] leading-relaxed">{desc}</div>
    </div>
  );
}