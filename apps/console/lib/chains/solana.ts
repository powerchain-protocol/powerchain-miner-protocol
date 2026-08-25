import {
  Connection,
  PublicKey,
  type Commitment,
} from "@solana/web3.js";
import bs58 from "bs58";

export function normalizeSolanaAddress(value: string): string {
  return new PublicKey(value).toBase58();
}

export function isSolanaAddress(value: string): boolean {
  try {
    normalizeSolanaAddress(value);
    return true;
  } catch {
    return false;
  }
}

export function decodeBase58(value: string): Uint8Array {
  return bs58.decode(value);
}

export function encodeBase58(value: Uint8Array): string {
  return bs58.encode(value);
}

export function createSolanaConnection(
  rpcUrl: string,
  commitment: Commitment = "confirmed",
): Connection {
  return new Connection(rpcUrl, commitment);
}

export function solanaExplorerUrl(input: {
  value: string;
  type: "address" | "tx";
  cluster?: "devnet" | "mainnet-beta";
}): string {
  const base =
    `https://explorer.solana.com/${input.type}/${encodeURIComponent(input.value)}`;

  return input.cluster === "devnet"
    ? `${base}?cluster=devnet`
    : base;
}
