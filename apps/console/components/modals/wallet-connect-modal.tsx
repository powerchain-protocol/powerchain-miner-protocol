"use client";

import { FiCheckCircle, FiExternalLink, FiShield } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/wallet-context";
import { appEvents } from "@/events";

export function WalletConnectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  const {
    address,
    providerName,
    connecting,
    error,
    connect,
    disconnect,
    detectedProvider,
  } = useWallet();
  const detected = detectedProvider();

  function changeOpen(nextOpen: boolean) {
    onOpenChange(nextOpen);
    appEvents.emit(nextOpen ? "modal:opened" : "modal:closed", {
      name: "wallet-connect",
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="wallet-connect-modal">
        <DialogHeader>
          <div className="wallet-connect-modal__icon">
            <FiShield aria-hidden="true" />
          </div>
          <DialogTitle>Wallet authorization</DialogTitle>
          <DialogDescription>
            Wallets authorize user-controlled Solana actions. Private keys never enter the
            PowerChain control plane.
          </DialogDescription>
        </DialogHeader>

        {address ? (
          <div className="wallet-connected-card">
            <FiCheckCircle aria-hidden="true" />
            <div>
              <span>Connected with {providerName ?? "Solana wallet"}</span>
              <code>{address}</code>
            </div>
          </div>
        ) : (
          <div className="wallet-provider-card">
            <div>
              <span>Detected wallet</span>
              <strong>{detected?.name ?? "No compatible wallet detected"}</strong>
            </div>
            {!detected && (
              <a href="https://solana.com/ecosystem/explore?categories=wallet" target="_blank" rel="noreferrer">
                Wallet options <FiExternalLink />
              </a>
            )}
          </div>
        )}

        {error && <div className="wallet-connect-error">{error}</div>}

        <div className="wallet-connect-modal__actions">
          {address ? (
            <Button variant="secondary" onClick={disconnect}>Disconnect</Button>
          ) : (
            <Button onClick={connect} disabled={connecting || !detected}>
              {connecting ? "Connecting…" : "Connect detected wallet"}
            </Button>
          )}
          <Button variant="ghost" onClick={() => changeOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
