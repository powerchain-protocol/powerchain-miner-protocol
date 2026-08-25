"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useMediaQueries() {
  return {
    mobile: useMediaQuery("(max-width: 767px)"),
    tablet: useMediaQuery("(min-width: 768px) and (max-width: 1199px)"),
    desktop: useMediaQuery("(min-width: 1200px)"),
    reducedMotion: useMediaQuery("(prefers-reduced-motion: reduce)"),
  };
}
