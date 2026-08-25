import { fetchData } from "@/data/fetch-data";
import type { PowerChainAccount } from "@/types/accounts";
import { normalizeUserId } from "./id";
import { userSlug } from "./slug";

export type ClientMemberResponse = {
  members: Array<{
    user_id: string;
    email: string;
    display_name: string;
    role: PowerChainAccount["role"];
    status: PowerChainAccount["status"];
    reward_wallet?: string | null;
  }>;
};

export async function fetchUsers(
  clientId: string,
): Promise<Array<PowerChainAccount & { slug: string }>> {
  const result = await fetchData<ClientMemberResponse>(
    `/api/console/users?clientId=${encodeURIComponent(clientId)}`,
  );
  return result.members.map((member) => ({
    id: normalizeUserId(member.user_id),
    email: member.email,
    displayName: member.display_name,
    role: member.role,
    status: member.status,
    clientId,
    rewardWallet: member.reward_wallet ?? null,
    slug: userSlug({
      displayName: member.display_name,
      email: member.email,
    }),
  }));
}
