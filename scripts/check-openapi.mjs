import { readFile } from "node:fs/promises";

const backend = await readFile(
  "apps/backend/openapi.yaml",
  "utf8",
);
for (const required of [
  "openapi:",
  "version: 1.0.0",
  "/api/v1/health:",
  "/api/v1/proofs:",
  "/api/v1/evidence-verifiers:",
  "/chain-binding/verify:",
  "/api/v1/reward-claims:",
  "/api/v1/audit/verify:",
  "/source-rotations:",
  "/api/v1/reward-claims/{claimId}/prepare:",
  "/api/v1/audit/checkpoints:",
  "/api/v1/core/capabilities:",
  "/api/v1/core/characters:",
  "/api/v1/agents:",
  "/api/v1/agents/{agentId}/compute:",
  "/api/v1/compute/models:",
  "/api/v1/releases/latest:",
  "/api/v1/integrations/helium/entity/wallet/{wallet}:",
  "/api/v1/integrations/helium/gateways:",
  "/api/v1/integrations/helium/programs:",
]) {
  if (!backend.includes(required)) {
    throw new Error(
      `Backend OpenAPI missing ${required}`,
    );
  }
}

const compute = await readFile(
  "apps/compute/openapi.yaml",
  "utf8",
);
for (const required of [
  "openapi:",
  "version: 1.0.0",
  "/v1/models:",
  "/v1/account:",
  "/v1/chat/completions:",
  "/v1/responses:",
  "/v1/topups/{intentId}/confirm:",
]) {
  if (!compute.includes(required)) {
    throw new Error(
      `Compute OpenAPI missing ${required}`,
    );
  }
}

console.log(
  "OpenAPI: backend + Agent Compute structure OK",
);
