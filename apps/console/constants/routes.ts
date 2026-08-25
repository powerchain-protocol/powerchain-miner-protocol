export const ROUTES = {
  home: "/",
  platform: "/superadmin",
  clients: "/clients",
  rewards: "/rewards",
  compute: "/compute",
  proofs: "/proofs",
  audit: "/audit",
  roles: "/roles",
  login: "/login",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const PROTECTED_ROUTES: readonly AppRoute[] = [
  ROUTES.platform,
  ROUTES.clients,
  ROUTES.rewards,
  ROUTES.compute,
  ROUTES.proofs,
  ROUTES.audit,
  ROUTES.roles,
];
