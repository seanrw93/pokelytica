"use client";

import { useSession } from "@/lib/auth-client";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";

export const Header = () => {
  const { data: session } = useSession();
  const showBattleHistory = Boolean(session);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-4">
        <BrandMark />

        <div className="hidden md:flex items-center gap-8">
          <NavLinks showBattleHistory={showBattleHistory} ariaLabel="Primary" />
        </div>

        <MobileMenu showBattleHistory={showBattleHistory} />
      </div>
    </header>
  );
};
