import { fetchData } from "@/data/fetch-data";
import type { AccountRole } from "@/types/accounts";

export type AuthSession = {
  actor: {
    userId: string;
    role: AccountRole | "SUPERADMIN";
    email?: string;
  };
  memberships: Array<{
    client_id: string;
    role: AccountRole;
    status: string;
  }>;
};

export function fetchAuthSession(): Promise<AuthSession> {
  return fetchData<AuthSession>("/api/console/session/me");
}
