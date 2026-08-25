"use client";

import { useMemo } from "react";
import { useWallet } from "@/context/wallet-context";
import { detectEmbeddedWallets } from "@/lib/wallets/embedded-wallets";

export function useEmbeddedWallets() {
  const wallet = useWallet();
  const wallets = useMemo(
    () => detectEmbeddedWallets(),
    [wallet.address],
  );
  return {
    wallets,
    connectedAddress: wallet.address,
    providerName: wallet.providerName,
    connecting: wallet.connecting,
    error: wallet.error,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
  };
}
