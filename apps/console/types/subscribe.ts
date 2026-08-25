export type SubscriptionTierId =
  | "FREE"
  | "PRO"
  | "BUSINESS";

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELLED";

export type Subscription = {
  id: string;
  tier: SubscriptionTierId;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
};
