import type { SubscriptionTierId } from "@/types/subscribe";

export type SubscriptionTier = {
  id: SubscriptionTierId;
  name: string;
  description: string;
  features: readonly string[];
};

export const SUBSCRIPTION_TIERS = Object.freeze([
  {
    id: "FREE",
    name: "Free",
    description: "Core monitoring and evaluation surfaces.",
    features: [
      "Miner overview",
      "Proof inspection",
      "Single-operator workspace",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    description: "Advanced operations and Agent Compute workflows.",
    features: [
      "Agent Compute",
      "Advanced reporting",
      "Expanded history",
    ],
  },
  {
    id: "BUSINESS",
    name: "Business",
    description: "Multi-user controls, governance and production operations.",
    features: [
      "Role-based approvals",
      "Multi-verifier policy",
      "Organization controls",
    ],
  },
] as const satisfies readonly SubscriptionTier[]);
