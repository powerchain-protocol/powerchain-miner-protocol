import { normalizeSolanaAddress } from "@/lib/chains/solana";

export type PaymentIntent = {
  id: string;
  rail: "solana-pay" | "pay.sh" | "external";
  amount: string;
  currency: string;
  status:
    | "review-required"
    | "authorized"
    | "submitted"
    | "confirmed"
    | "failed";
};

export function buildSolanaPayTransferUrl(input: {
  recipient: string;
  amount?: string;
  splToken?: string;
  label?: string;
  message?: string;
  memo?: string;
}): string {
  const recipient = normalizeSolanaAddress(input.recipient);
  const params = new URLSearchParams();
  if (input.amount) params.set("amount", input.amount);
  if (input.splToken) {
    params.set(
      "spl-token",
      normalizeSolanaAddress(input.splToken),
    );
  }
  if (input.label) params.set("label", input.label);
  if (input.message) params.set("message", input.message);
  if (input.memo) params.set("memo", input.memo);
  const query = params.toString();
  return `solana:${recipient}${query ? `?${query}` : ""}`;
}
