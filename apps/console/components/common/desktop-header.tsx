"use client";

import { FiChevronDown, FiLogOut, FiMenu, FiMoon, FiSun } from "react-icons/fi";
import { NetworkBadge } from "@/components/common/network-badge";
import { WalletConnectButton } from "@/components/common/wallet-connect-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/context/app-context";

export function DesktopHeader({
  title,
  eyebrow,
  isSuperadmin,
}: {
  title: string;
  eyebrow: string;
  isSuperadmin: boolean;
}) {
  const { theme, toggleTheme, toggleMobileNavigation } = useAppContext();

  return (
    <header className="desktop-header">
      <div className="desktop-header__title">
        <button
          type="button"
          className="desktop-header__mobile-menu"
          onClick={toggleMobileNavigation}
          aria-label="Toggle navigation"
        >
          <FiMenu aria-hidden="true" />
        </button>
        <div>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="desktop-header__actions">
        <NetworkBadge />
        <WalletConnectButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="desktop-user-menu">
              <span className="desktop-user-menu__avatar">
                {isSuperadmin ? "SA" : "OP"}
              </span>
              <span className="desktop-user-menu__copy">
                <strong>{isSuperadmin ? "SuperAdmin" : "Operator"}</strong>
                <small>PowerChain Console</small>
              </span>
              <FiChevronDown aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem onSelect={toggleTheme}>
              {theme === "light" ? <FiMoon /> : <FiSun />}
              Use {theme === "light" ? "dark" : "light"} theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action="/api/session/logout" method="post">
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full">
                  <FiLogOut /> Sign out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
