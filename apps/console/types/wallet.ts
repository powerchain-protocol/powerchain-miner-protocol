export type InjectedSolanaProvider = {
  isPhantom?: boolean;
  isBackpack?: boolean;
  isSolflare?: boolean;
  publicKey?: { toBase58(): string } | null;
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{
    publicKey?: { toBase58(): string };
  }>;
  disconnect?(): Promise<void>;
};

declare global {
  interface Window {
    solana?: InjectedSolanaProvider;
    phantom?: { solana?: InjectedSolanaProvider };
    backpack?: { solana?: InjectedSolanaProvider };
    solflare?: InjectedSolanaProvider;
  }
}

export {};
