import type { Network } from "@/lib/types";

export function network(): Network {
  return process.env.POWERCHAIN_NETWORK === "mainnet-beta" ? "mainnet-beta" : "devnet";
}

export function rewardPerWhBaseUnits() {
  const value = Number(process.env.MINER_REWARD_PER_WH_BASE_UNITS ?? "1000000");
  return Number.isSafeInteger(value) && value > 0 ? value : 1_000_000;
}

export function maxProofWh() {
  const value = Number(process.env.MINER_MAX_PROOF_WH ?? "1000000");
  return Number.isSafeInteger(value) && value > 0 ? value : 1_000_000;
}
