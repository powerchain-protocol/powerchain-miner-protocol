"use client";

import type { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AppProvider } from "./app-context";
import { WalletProvider } from "./wallet-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <WalletProvider>
        <TooltipPrimitive.Provider delayDuration={250}>
          {children}
        </TooltipPrimitive.Provider>
      </WalletProvider>
    </AppProvider>
  );
}
