import { solanaExplorerUrl } from "./solana";
import { suiExplorerUrl } from "./sui";

export type ChainTransaction = {
  chain: "solana" | "sui";
  signature: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
};

export function transactionExplorerUrl(
  transaction: ChainTransaction,
): string {
  return transaction.chain === "solana"
    ? solanaExplorerUrl({
        type: "tx",
        value: transaction.signature,
      })
    : suiExplorerUrl({
        type: "txblock",
        value: transaction.signature,
      });
}
