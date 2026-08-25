import {
  isSolanaAddress,
  solanaExplorerUrl,
} from "./solana";
import {
  isSuiAddress,
  suiExplorerUrl,
} from "./sui";

export type SupportedChain = "solana" | "sui";

export const BLOCKCHAINS = {
  solana: {
    id: "solana",
    label: "Solana",
    validateAddress: isSolanaAddress,
    addressUrl: (value: string) =>
      solanaExplorerUrl({
        value,
        type: "address",
      }),
  },
  sui: {
    id: "sui",
    label: "Sui",
    validateAddress: isSuiAddress,
    addressUrl: (value: string) =>
      suiExplorerUrl({
        value,
        type: "address",
      }),
  },
} as const;

export * from "./solana";
export * from "./sui";
export * from "./transactions";
