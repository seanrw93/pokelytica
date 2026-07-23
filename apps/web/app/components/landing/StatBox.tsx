type StatBoxProps = {
    value: string,
    label: string,
    color: string
}

export const StatBox = ({ value, label, color }: StatBoxProps) => {
  return (
    <div className="bg-[#1a1a2e] border border-[#2e2e50] rounded-xl p-5 text-center">
      <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[#7878a0] tracking-wide">{label}</div>
    </div>
  );
}