"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/constants/ui";
import { appEvents } from "@/events";
import type { AppTheme } from "@/types/events";

type AppContextValue = {
  theme: AppTheme;
  setTheme(theme: AppTheme): void;
  toggleTheme(): void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleSidebar(): void;
  mobileNavigationOpen: boolean;
  setMobileNavigationOpen(open: boolean): void;
  toggleMobileNavigation(): void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("light");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeState(storedTheme);
    }

    setSidebarCollapsedState(
      window.localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === "true",
    );
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    appEvents.emit("theme:changed", { theme: nextTheme });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    window.localStorage.setItem(
      STORAGE_KEYS.sidebarCollapsed,
      String(collapsed),
    );
    appEvents.emit("sidebar:changed", { collapsed });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed),
      mobileNavigationOpen,
      setMobileNavigationOpen,
      toggleMobileNavigation: () => setMobileNavigationOpen(!mobileNavigationOpen),
    }),
    [
      theme,
      sidebarCollapsed,
      mobileNavigationOpen,
      setTheme,
      setSidebarCollapsed,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider.");
  }
  return context;
}
