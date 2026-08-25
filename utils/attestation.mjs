import { createHash } from "node:crypto";
import { canonicalJson } from "./canonical-json.mjs";

export function canonicalAttestationPayload(input) {
  return {
    proofId: input.proofId,
    verifierRegistryId: input.verifierRegistryId,
    decision: input.decision,
    qualityBps: input.qualityBps,
    proofDigest: input.proofDigest,
    sourceHash: input.sourceHash,
  };
}

export function attestationDigest(input) {
  return createHash("sha256")
    .update(canonicalJson(canonicalAttestationPayload(input)), "utf8")
    .digest("hex");
}
