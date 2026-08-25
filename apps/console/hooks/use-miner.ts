"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchData } from "@/data/fetch-data";
import type { Device, Proof } from "@/lib/types";

export type MinerOverview = {
  network: "devnet" | "mainnet-beta";
  simulated: boolean;
  metrics: {
    activeNodes: number;
    totalNodes: number;
    verifiedEnergyKwh: number;
    totalRewardBaseUnits: number;
    proofCount: number;
  };
  devices: Device[];
  proofs: Proof[];
};

export function useMiner(refreshMs = 15_000) {
  const [data, setData] = useState<MinerOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchData<MinerOverview>("/api/v1/dashboard"));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Miner overview request failed.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), refreshMs);
    return () => window.clearInterval(id);
  }, [refresh, refreshMs]);

  return { data, error, loading, refresh };
}
