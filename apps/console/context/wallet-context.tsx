"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { appEvents } from "@/events";
import type { InjectedSolanaProvider } from "@/types/wallet";

type WalletState = {
  address: string | null;
  providerName: string | null;
  connecting: boolean;
  error: string | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  detectedProvider(): { name: string; provider: InjectedSolanaProvider } | null;
};

const WalletContext = createContext<WalletState | null>(null);

function resolveProvider() {
  if (typeof window === "undefined") return null;

  const candidates = [
    ["Phantom", window.phantom?.solana],
    ["Backpack", window.backpack?.solana],
    ["Solflare", window.solflare],
    ["Solana Wallet", window.solana],
  ] as const;

  for (const [name, provider] of candidates) {
    if (provider?.connect) return { name, provider };
  }

  return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    const detected = resolveProvider();
    appEvents.emit("wallet:connect-requested", { source: "desktop-header" });

    if (!detected) {
      setError("No compatible Solana wallet was detected in this browser.");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const result = await detected.provider.connect();
      const nextAddress =
        result.publicKey?.toBase58() ??
        detected.provider.publicKey?.toBase58() ??
        null;

      if (!nextAddress) {
        throw new Error("Wallet connected without returning a public key.");
      }

      setAddress(nextAddress);
      setProviderName(detected.name);
      appEvents.emit("wallet:connected", {
        address: nextAddress,
        provider: detected.name,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wallet connection failed.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const detected = resolveProvider();
    await detected?.provider.disconnect?.();
    setAddress(null);
    setProviderName(null);
    setError(null);
    appEvents.emit("wallet:disconnected", undefined);
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      address,
      providerName,
      connecting,
      error,
      connect,
      disconnect,
      detectedProvider: resolveProvider,
    }),
    [address, providerName, connecting, error, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider.");
  }
  return context;
}
