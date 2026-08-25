import type {
  PortfolioPosition,
  PortfolioSummary,
} from "@/types/portfolio";

export function summarizePortfolio(
  positions: readonly PortfolioPosition[],
): PortfolioSummary {
  const normalized = positions.map((position) => ({
    ...position,
    valueUsd:
      position.valueUsd ??
      (position.priceUsd == null
        ? null
        : Number(position.quantity) * position.priceUsd),
  }));

  const priced = normalized.filter(
    (position) => position.valueUsd != null,
  );
  return {
    positions: normalized,
    totalValueUsd: priced.reduce(
      (total, position) =>
        total + (position.valueUsd ?? 0),
      0,
    ),
    pricedPositions: priced.length,
    unpricedPositions:
      normalized.length - priced.length,
  };
}
