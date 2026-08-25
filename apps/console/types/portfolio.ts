import type { Asset } from "@/types/assets";

export type PortfolioPosition = {
  asset: Asset;
  quantity: string;
  priceUsd?: number | null;
  valueUsd?: number | null;
};

export type PortfolioSummary = {
  positions: PortfolioPosition[];
  totalValueUsd: number;
  pricedPositions: number;
  unpricedPositions: number;
};
