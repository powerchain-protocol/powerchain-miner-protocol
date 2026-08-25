export const NETWORKS = ["devnet", "mainnet-beta"] as const;
export type PowerChainNetwork = (typeof NETWORKS)[number];

export const DEFAULT_NETWORK: PowerChainNetwork = "devnet";

export const NETWORK_LABELS: Record<PowerChainNetwork, string> = {
  devnet: "Solana · Devnet",
  "mainnet-beta": "Solana · Mainnet",
};
