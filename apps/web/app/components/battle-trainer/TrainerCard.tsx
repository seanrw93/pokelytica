import { Sprites } from "@pkmn/img";
import Link from "next/link";
import { getTrainerRole } from "../../utils/trainerRole";

type TrainerCardProps = {
  name: string;
  title: string;
  spriteId: string;
  generation: number;
};

export const TrainerCard = ({ name, title, spriteId, generation }: TrainerCardProps) => {
  const avatar = Sprites.getAvatar(spriteId);
  const role = getTrainerRole(title);

  return (
    <Link
      href={`/team-builder?trainer=${encodeURIComponent(name)}`}
      className="group bg-surface border border-border rounded-lg p-3 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:border-accent hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
    >
      <div className="w-16 h-16 rounded-md bg-surface-raised flex items-center justify-center overflow-hidden">
        <img src={avatar} alt={name} className="w-14 h-14 object-contain" />
      </div>

      <div className="min-w-0">
        <div className="font-semibold text-foreground truncate w-full">{name}</div>
        <div className="text-xs text-muted-light truncate w-full">{title}</div>
      </div>

      <div className="flex items-center gap-1.5 text-[0.65rem] font-mono uppercase tracking-wide text-muted">
        <span className="px-1.5 py-0.5 rounded-full bg-surface-raised border border-border group-hover:border-accent/40 transition-colors">
          {role}
        </span>
        <span>Gen {generation}</span>
      </div>
    </Link>
  );
};
