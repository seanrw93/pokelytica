import Link from "next/link";

export const BottomCTA = () => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Link
        href="/team-builder"
        className="w-full sm:w-auto text-center bg-[#e3350d] hover:bg-[#ff4520] active:scale-95 transition text-white font-semibold px-6 sm:px-9 py-3 rounded-lg"
      >
        Start building →
      </Link>

      <p className="text-xs text-[#7878a0] px-4">
        No account needed — just pick your Pokémon and go
      </p>
    </div>
  );
}