import type { ChainTransaction } from "@/lib/chains/transactions";

export function recentTransactions(
  transactions: readonly ChainTransaction[],
  limit = 20,
): ChainTransaction[] {
  return [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, Math.max(0, limit));
}

export function transactionCounts(
  transactions: readonly ChainTransaction[],
) {
  return transactions.reduce(
    (counts, transaction) => {
      counts[transaction.status] += 1;
      return counts;
    },
    { pending: 0, confirmed: 0, failed: 0 },
  );
}
