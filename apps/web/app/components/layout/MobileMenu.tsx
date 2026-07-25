"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { PiList, PiX, PiSignOut } from "react-icons/pi";
import { signOut, useSession } from "@/lib/auth-client";
import { getTier, TierBadge } from "./TierBadge";
import { NavLinks } from "./NavLinks";

export const MobileMenu = ({ showBattleHistory }: { showBattleHistory: boolean }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async (close: () => void) => {
    await signOut();
    close();
    router.push("/");
  };

  return (
    <Popover className="relative md:hidden">
      <PopoverButton className="p-2 -mr-2 rounded-md text-foreground hover:bg-surface-raised transition-colors" aria-label="Toggle menu">
        {({ open }) => (open ? <PiX className="w-5 h-5" /> : <PiList className="w-5 h-5" />)}
      </PopoverButton>

      <PopoverPanel className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-surface-raised shadow-lg z-50 p-4 space-y-4">
        {({ close }) => (
          <>
            <NavLinks
              showBattleHistory={showBattleHistory}
              onNavigate={close}
              className="flex flex-col gap-3"
              ariaLabel="Mobile"
            />

            <div className="border-t border-border pt-4">
              {isPending ? null : session ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate">{session.user.name}</span>
                    <TierBadge tier={getTier(session.user)} />
                  </div>
                  <button
                    onClick={() => handleSignOut(close)}
                    className="flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors"
                  >
                    <PiSignOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => close()}
                  className="block text-center bg-accent hover:bg-accent-hover text-background font-semibold px-4 py-2 rounded-full text-sm transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
};
