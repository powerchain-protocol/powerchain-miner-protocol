import type { MailMessage } from "@/types/mail";

export function securityAlertMessage(input: {
  to: string;
  title: string;
  detail: string;
}): MailMessage {
  return {
    to: [{ email: input.to }],
    subject: `[PowerChain] ${input.title}`,
    text:
      `${input.title}\n\n${input.detail}\n\n` +
      "Review the event in the authenticated PowerChain console.",
  };
}

export function rewardClaimMessage(input: {
  to: string;
  claimId: string;
  status: string;
}): MailMessage {
  return {
    to: [{ email: input.to }],
    subject: `[PowerChain] Reward claim ${input.status}`,
    text:
      `Reward claim ${input.claimId} is ${input.status}.\n\n` +
      "Wallet authorization and settlement remain separate steps.",
  };
}
