export type AssetChain = "solana" | "sui" | "offchain";

export type AssetKind =
  | "energy"
  | "token"
  | "stablecoin"
  | "device"
  | "compute-credit";

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  chain: AssetChain;
  kind: AssetKind;
  address?: string | null;
  decimals?: number | null;
};
