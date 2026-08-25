export function isSuiAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

export function normalizeSuiAddress(value: string): string {
  const normalized = value.toLowerCase();
  if (!isSuiAddress(normalized)) {
    throw new Error("Invalid Sui address.");
  }
  return normalized;
}

export function suiExplorerUrl(input: {
  value: string;
  type: "address" | "txblock";
  network?: "mainnet" | "testnet" | "devnet";
}): string {
  const network = input.network ?? "mainnet";
  return `https://suiscan.xyz/${network}/${input.type}/${encodeURIComponent(input.value)}`;
}
