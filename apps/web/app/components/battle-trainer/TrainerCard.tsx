import { Sprites } from "@pkmn/img";
import Link from "next/link";

type TrainerCardProps = {
  name: string;
  title: string;
  spriteId: string;
};

export const TrainerCard = ({ name, title, spriteId }: TrainerCardProps) => {
  const avatar = Sprites.getAvatar(spriteId);

  return (
    <Link
      href={`/team-builder?trainer=${encodeURIComponent(name)}`}
      className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-surface-raised transition-colors"
    >
      <img src={avatar} alt={name} className="w-16 h-16" />
      <span className="font-semibold text-foreground text-center">{name}</span>
      <span className="text-sm text-muted-light text-center">{title}</span>
    </Link>
  );
};
