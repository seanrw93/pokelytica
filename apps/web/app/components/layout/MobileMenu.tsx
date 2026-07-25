"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { PiList, PiX } from "react-icons/pi";
import { NavLinks } from "./NavLinks";

export const MobileMenu = ({ showBattleHistory }: { showBattleHistory: boolean }) => {
  return (
    <Popover className="relative md:hidden">
      <PopoverButton className="p-2 -mr-2 rounded-md text-foreground hover:bg-surface-raised transition-colors" aria-label="Toggle menu">
        {({ open }) => (open ? <PiX className="w-5 h-5" /> : <PiList className="w-5 h-5" />)}
      </PopoverButton>

      <PopoverPanel className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-surface-raised shadow-lg z-50 p-4">
        {({ close }) => (
          <NavLinks
            showBattleHistory={showBattleHistory}
            onNavigate={close}
            className="flex flex-col gap-3"
            ariaLabel="Mobile"
          />
        )}
      </PopoverPanel>
    </Popover>
  );
};
