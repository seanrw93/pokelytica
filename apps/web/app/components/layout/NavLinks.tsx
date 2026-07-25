"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinksProps = {
  showBattleHistory: boolean;
  onNavigate?: () => void;
  className?: string;
  ariaLabel: string;
};

const BASE_LINKS = [
  { href: "/team-builder", label: "Team Builder" },
  { href: "/battle-trainer", label: "Battle a Trainer" },
];

export const NavLinks = ({ showBattleHistory, onNavigate, className, ariaLabel }: NavLinksProps) => {
  const pathname = usePathname();
  const links = showBattleHistory
    ? [...BASE_LINKS, { href: "/battle-history", label: "Battle History" }]
    : BASE_LINKS;

  return (
    <nav aria-label={ariaLabel} className={className ?? "flex items-center gap-6"}>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={
              "text-sm font-medium transition-colors " +
              (active ? "text-accent" : "text-muted-light hover:text-foreground")
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
