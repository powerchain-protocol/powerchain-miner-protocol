export function formatNumber(
  value: number | bigint,
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(value);
}

export function formatCurrency(
  value: number,
  currency = "USD",
): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(
  value: string | number | Date,
): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatEnergyWh(value: bigint | number): string {
  const wh = Number(value);
  if (Math.abs(wh) >= 1_000_000) {
    return `${formatNumber(wh / 1_000_000)} MWh`;
  }
  if (Math.abs(wh) >= 1_000) {
    return `${formatNumber(wh / 1_000)} kWh`;
  }
  return `${formatNumber(wh)} Wh`;
}
