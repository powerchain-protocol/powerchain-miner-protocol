export type AppTheme = "light" | "dark";

export type AppEventMap = {
  "theme:changed": { theme: AppTheme };
  "sidebar:changed": { collapsed: boolean };
  "wallet:connect-requested": { source: string };
  "wallet:connected": { address: string; provider: string };
  "wallet:disconnected": undefined;
  "node:pair-requested": { source: string };
  "proof:selected": { proofId: string };
  "modal:opened": { name: string };
  "modal:closed": { name: string };
};
