type StepItemProps = {
    index: string;
    title: string;
    desc: string;
    isLast: boolean
}

export const StepItem = ({ index, title, desc, isLast }: StepItemProps) => {
  return (
    <div className="flex-1 flex flex-col items-center text-center px-4 py-4 md:py-0 relative">
      {!isLast && (
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-1/2 bg-[#2e2e50]" />
      )}

      <div className="w-8 h-8 rounded-full bg-[#222240] border border-[#2e2e50] flex items-center justify-center text-xs font-semibold text-[#ffcb05] mb-3">
        {index}
      </div>

      <div className="text-sm font-semibold mb-1">{title}</div>
      <div className="text-xs text-[#7878a0] leading-relaxed max-w-55">
        {desc}
      </div>
    </div>
  );
}