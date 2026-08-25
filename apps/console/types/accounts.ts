export type AccountRole =
  | "SUPERADMIN"
  | "CLIENT_ADMIN"
  | "OPERATOR"
  | "FINANCE"
  | "VERIFIER"
  | "VIEWER";

export type AccountStatus =
  | "ACTIVE"
  | "DISABLED"
  | "PENDING";

export type PowerChainAccount = {
  id: string;
  email: string;
  displayName: string;
  role?: AccountRole | null;
  status: AccountStatus;
  clientId?: string | null;
  rewardWallet?: string | null;
};
