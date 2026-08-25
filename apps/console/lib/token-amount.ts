export function decimalToBaseUnits(value: string, decimals = 9): string {
  const normalized = value.trim();
  if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(normalized)) {
    throw new Error("Amount must be a positive decimal number.");
  }

  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) {
    throw new Error(`Amount supports at most ${decimals} decimal places.`);
  }

  const padded = fraction.padEnd(decimals, "0");
  const units = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || "0");
  if (units <= 0n) throw new Error("Amount must be greater than zero.");
  return units.toString();
}
