export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Process-local UI/BFF limiter.
 *
 * The backend remains the authoritative distributed
 * enforcement boundary for production API traffic.
 */
export function createLocalRateLimiter(input: {
  limit: number;
  windowMs: number;
}) {
  const buckets = new Map<
    string,
    {
      count: number;
      resetAt: number;
    }
  >();

  return {
    check(
      key: string,
      now = Date.now(),
    ): RateLimitDecision {
      const existing = buckets.get(key);

      const bucket =
        !existing || existing.resetAt <= now
          ? {
              count: 0,
              resetAt: now + input.windowMs,
            }
          : existing;

      bucket.count += 1;
      buckets.set(key, bucket);

      return {
        allowed: bucket.count <= input.limit,
        remaining: Math.max(
          0,
          input.limit - bucket.count,
        ),
        resetAt: bucket.resetAt,
      };
    },

    clear(key?: string) {
      if (key) {
        buckets.delete(key);
      } else {
        buckets.clear();
      }
    },
  };
}
