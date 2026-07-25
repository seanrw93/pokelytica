"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { PiCaretDownBold, PiSignOut } from "react-icons/pi";
import { signOut, useSession } from "@/lib/auth-client";
import { getTier, TierBadge } from "./TierBadge";

export const AccountMenu = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="w-24 h-9 rounded-full bg-surface-raised animate-pulse" />;
  }

  if (!session) {
    return (
      <Link
        href="/sign-in"
        className="bg-accent hover:bg-accent-hover text-background font-semibold px-4 py-2 rounded-full text-sm transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const { user } = session;
  const tier = getTier(user);
  const initials = user.name?.charAt(0)?.toUpperCase() ?? "?";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-full border border-border bg-surface-raised px-2 py-1.5 hover:border-accent transition-colors">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="w-6 h-6 rounded-full" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
        )}
        <span className="text-sm text-foreground max-w-[8rem] truncate">{user.name}</span>
        <TierBadge tier={tier} />
        <PiCaretDownBold className="w-3 h-3 text-muted" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="mt-2 w-52 rounded-lg border border-border bg-surface-raised shadow-lg py-1 focus:outline-none z-50"
      >
        <div className="px-3 py-2 border-b border-border">
          <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
          <div className="text-xs text-muted truncate">{user.email}</div>
        </div>
        <MenuItem>
          {({ focus }) => (
            <button
              onClick={handleSignOut}
              className={
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors " +
                (focus ? "bg-surface text-foreground" : "text-muted-light")
              }
            >
              <PiSignOut className="w-4 h-4" />
              Sign out
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};
