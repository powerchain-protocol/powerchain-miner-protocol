"use client";

import { useEffect, useState } from "react";
import { fetchUsers } from "@/data/users";
import type { PowerChainAccount } from "@/types/accounts";

export function useUsers(clientId: string | null) {
  const [users, setUsers] = useState<PowerChainAccount[]>([]);
  const [loading, setLoading] = useState(Boolean(clientId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!clientId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    void fetchUsers(clientId)
      .then((next) => {
        if (!cancelled) setUsers(next);
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "User request failed.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return { users, loading, error };
}
