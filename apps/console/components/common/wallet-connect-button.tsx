"use client";

import { useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import { WalletConnectModal } from "@/components/modals/wallet-connect-modal";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/wallet-context";

function compact(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const [open, setOpen] = useState(false);
  const { address } = useWallet();

  return (
    <>
      <Button
        variant={address ? "secondary" : "default"}
        size="sm"
        onClick={() => setOpen(true)}
        className="wallet-connect-trigger"
      >
        <FiCreditCard aria-hidden="true" />
        {address ? compact(address) : "Connect wallet"}
      </Button>
      <WalletConnectModal open={open} onOpenChange={setOpen} />
    </>
  );
}
