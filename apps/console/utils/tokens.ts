export function formatBaseUnits(input: {
  amount: bigint | string;
  decimals: number;
  maximumFractionDigits?: number;
}): string {
  const amount = BigInt(input.amount);
  const decimals = Math.max(0, input.decimals);
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = (amount % divisor)
    .toString()
    .padStart(decimals, "0")
    .slice(0, input.maximumFractionDigits ?? decimals)
    .replace(/0+$/, "");
  return fraction
    ? `${whole.toLocaleString()}.${fraction}`
    : whole.toLocaleString();
}

export function parseDecimalToBaseUnits(
  value: string,
  decimals: number,
): bigint {
  if (!/^\d+(?:\.\d+)?$/.test(value)) {
    throw new Error("Amount must be a non-negative decimal string.");
  }
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals) {
    throw new Error(
      `Amount has more than ${decimals} decimal places.`,
    );
  }
  return (
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt((fraction + "0".repeat(decimals)).slice(0, decimals) || "0")
  );
}
