"use client";

import { useCallback, useState } from "react";
import { appEvents } from "@/events";
import {
  prepareAiRequest,
  type AiRequest,
  type AiResult,
} from "@/lib/ai";

export function useAI<TInput, TOutput>(
  execute: (
    request: AiRequest<TInput>,
  ) => Promise<AiResult<TOutput>>,
) {
  const [result, setResult] = useState<AiResult<TOutput> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(
    async (request: AiRequest<TInput>) => {
      setRunning(true);
      setError(null);
      appEvents.emit("ai:started", { task: request.task });
      try {
        const next = await execute(
          prepareAiRequest(request),
        );
        setResult(next);
        appEvents.emit("ai:completed", {
          task: request.task,
          requiresReview: next.requiresReview,
        });
        return next;
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "AI request failed.",
        );
        throw cause;
      } finally {
        setRunning(false);
      }
    },
    [execute],
  );

  return { run, result, error, running };
}
