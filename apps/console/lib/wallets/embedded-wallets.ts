import type {
  InjectedSolanaProvider,
} from "@/types/wallet";

export type EmbeddedWalletDescriptor = {
  id: string;
  name: string;
  provider: InjectedSolanaProvider;
};

export function detectEmbeddedWallets():
  EmbeddedWalletDescriptor[] {
  if (typeof window === "undefined") {
    return [];
  }

  const candidates = [
    ["phantom", "Phantom", window.phantom?.solana],
    ["backpack", "Backpack", window.backpack?.solana],
    ["solflare", "Solflare", window.solflare],
    ["solana", "Solana Wallet", window.solana],
  ] as const;

  const seen =
    new Set<InjectedSolanaProvider>();
  const wallets:
    EmbeddedWalletDescriptor[] = [];

  for (const [id, name, provider] of candidates) {
    if (!provider?.connect || seen.has(provider)) {
      continue;
    }

    seen.add(provider);
    wallets.push({
      id,
      name,
      provider,
    });
  }

  return wallets;
}
