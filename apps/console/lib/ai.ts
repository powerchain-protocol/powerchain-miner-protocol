export type AiEvidenceRef = {
  id: string;
  source: string;
  observedAt?: string | null;
};

export type AiRequest<TInput = unknown> = {
  task: string;
  input: TInput;
  evidence: readonly AiEvidenceRef[];
};

export type AiResult<TOutput = unknown> = {
  output: TOutput;
  evidence: readonly AiEvidenceRef[];
  requiresReview: boolean;
};

export function prepareAiRequest<TInput>(
  request: AiRequest<TInput>,
): AiRequest<TInput> {
  if (!request.task.trim()) {
    throw new Error("AI task is required.");
  }
  return {
    ...request,
    evidence: [...request.evidence],
  };
}

export const AI_CONTROL_BOUNDARY = Object.freeze({
  physicalTruth: "external",
  canSignTransactions: false,
  canHoldPrivateKeys: false,
  executionRequiresReview: true,
});
