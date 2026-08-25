"use client";

import { useMemo } from "react";
import { SUBSCRIPTION_TIERS } from "@/constants/tiers";
import type { Subscription } from "@/types/subscribe";

export function useSubscriptions(
  subscription: Subscription | null,
) {
  const tier = useMemo(
    () =>
      SUBSCRIPTION_TIERS.find(
        (candidate) =>
          candidate.id === (subscription?.tier ?? "FREE"),
      ) ?? SUBSCRIPTION_TIERS[0],
    [subscription?.tier],
  );

  return {
    subscription,
    tier,
    active:
      subscription?.status === "ACTIVE" ||
      subscription?.status === "TRIALING",
  };
}
