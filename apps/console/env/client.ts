import {
  DEFAULT_NETWORK,
  type PowerChainNetwork,
} from "@/constants/networks";

function network(value: string | undefined): PowerChainNetwork {
  return value === "mainnet-beta" ? "mainnet-beta" : DEFAULT_NETWORK;
}

export const clientEnv = {
  network: network(process.env.NEXT_PUBLIC_POWERCHAIN_NETWORK),
  solanaRpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    "https://api.devnet.solana.com",
  appEnvironment:
    process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? "development",
} as const;
