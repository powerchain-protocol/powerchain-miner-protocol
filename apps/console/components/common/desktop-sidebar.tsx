"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  FiActivity,
  FiAward,
  FiChevronLeft,
  FiCpu,
  FiFileText,
  FiGrid,
  FiKey,
  FiMonitor,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { Brand } from "@/components/common/brand";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DESKTOP_NAVIGATION, type NavigationIcon } from "@/config/navigation";
import { useAppContext } from "@/context/app-context";
import { cn } from "@/lib/utils";

const icons: Record<NavigationIcon, typeof FiGrid> = {
  platform: FiGrid,
  clients: FiUsers,
  rewards: FiAward,
  compute: FiCpu,
  proofs: FiShield,
  audit: FiFileText,
  roles: FiKey,
  console: FiMonitor,
};

export function DesktopSidebar({ isSuperadmin }: { isSuperadmin: boolean }) {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileNavigationOpen,
    setMobileNavigationOpen,
  } = useAppContext();

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname, setMobileNavigationOpen]);

  return (
    <aside
      className={cn(
        "desktop-sidebar",
        sidebarCollapsed && "desktop-sidebar--collapsed",
        mobileNavigationOpen && "desktop-sidebar--mobile-open",
      )}
    >
      <Brand compact={sidebarCollapsed} />

      <nav className="desktop-sidebar__nav" aria-label="Primary navigation">
        {DESKTOP_NAVIGATION.map((item) => {
          const Icon = icons[item.icon];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const link = (
            <Link
              href={item.href}
              className={cn(
                "desktop-nav-item",
                active && "desktop-nav-item--active",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden="true" />
              {!sidebarCollapsed && (
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              )}
            </Link>
          );

          return sidebarCollapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <span key={item.href}>{link}</span>
          );
        })}
      </nav>

      <div className="desktop-sidebar__footer">
        {!sidebarCollapsed && (
          <div className="desktop-runtime-card">
            <span className="desktop-runtime-card__icon">
              <FiActivity aria-hidden="true" />
            </span>
            <span>
              <strong>Control plane</strong>
              <small>{isSuperadmin ? "SuperAdmin" : "Client user"}</small>
            </span>
            <i aria-label="Online" />
          </div>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          className="desktop-sidebar__collapse"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiChevronLeft
            aria-hidden="true"
            className={cn(sidebarCollapsed && "rotate-180")}
          />
          {!sidebarCollapsed && <span>Collapse navigation</span>}
        </button>
      </div>
    </aside>
  );
}
