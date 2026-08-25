import { ROUTES, type AppRoute } from "@/constants/routes";

export type NavigationIcon =
  | "platform"
  | "clients"
  | "rewards"
  | "compute"
  | "proofs"
  | "audit"
  | "roles"
  | "console";

export type NavigationItem = {
  href: AppRoute;
  label: string;
  description: string;
  icon: NavigationIcon;
};

export const DESKTOP_NAVIGATION: readonly NavigationItem[] = [
  {
    href: ROUTES.platform,
    label: "Platform",
    description: "System and tenant operations",
    icon: "platform",
  },
  {
    href: ROUTES.clients,
    label: "Clients",
    description: "Organizations and memberships",
    icon: "clients",
  },
  {
    href: ROUTES.rewards,
    label: "Rewards",
    description: "Accrual, approvals and claims",
    icon: "rewards",
  },
  {
    href: ROUTES.compute,
    label: "Agent Compute",
    description: "Wallet-funded model compute",
    icon: "compute",
  },
  {
    href: ROUTES.proofs,
    label: "Proofs",
    description: "Proof-of-Energy provenance",
    icon: "proofs",
  },
  {
    href: ROUTES.audit,
    label: "Audit",
    description: "Evidence and immutable controls",
    icon: "audit",
  },
  {
    href: ROUTES.roles,
    label: "Roles & Access",
    description: "RBAC and approval boundaries",
    icon: "roles",
  },
  {
    href: ROUTES.home,
    label: "Node Console",
    description: "Renewable node operations",
    icon: "console",
  },
] as const;
