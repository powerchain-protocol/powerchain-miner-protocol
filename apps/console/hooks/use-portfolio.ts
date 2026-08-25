"use client";

import { useMemo } from "react";
import { summarizePortfolio } from "@/data/balances";
import type { PortfolioPosition } from "@/types/portfolio";

export function usePortfolio(
  positions: readonly PortfolioPosition[],
) {
  return useMemo(
    () => summarizePortfolio(positions),
    [positions],
  );
}
