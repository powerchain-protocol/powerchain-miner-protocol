import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const settlementMigration = await readFile(
  "apps/backend/migrations/010_v100_settlement_leases.sql",
  "utf8",
);
const governanceMigration = await readFile(
  "apps/backend/migrations/011_v100_governance_controls.sql",
  "utf8",
);
const settlementDomain = await readFile(
  "apps/backend/src/domain/proof-settlement.ts",
  "utf8",
);
const worker = await readFile(
  "services/verifier-worker/src/index.ts",
  "utf8",
);
const claims = await readFile(
  "apps/backend/src/domain/claims.ts",
  "utf8",
);
const evidence = await readFile(
  "apps/backend/src/evidence.ts",
  "utf8",
);
const chainHealth = await readFile(
  "apps/backend/src/domain/chain-health.ts",
  "utf8",
);
const server = await readFile(
  "apps/backend/src/server.ts",
  "utf8",
);

test("proof settlement queue uses leases and SKIP LOCKED", () => {
  assert.match(settlementMigration, /settlement_lease_id uuid/);
  assert.match(settlementMigration, /proof_settlement_intents/);
  assert.match(settlementDomain, /FOR UPDATE OF p SKIP LOCKED/);
  assert.match(settlementDomain, /SETTLEMENT_LEASE_LOST/);
  assert.match(server, /PROOF_QUEUE_REQUIRES_LEASE/);
});

test("worker persists a signed settlement intent before broadcasting", () => {
  const intent = worker.indexOf("await prepareIntent");
  const broadcast = worker.indexOf("sendRawTransaction");
  assert.ok(intent >= 0, "prepare intent call missing");
  assert.ok(broadcast > intent, "transaction must not broadcast before intent persistence");
  assert.match(worker, /prior intent still live; no blind resubmit/);
  assert.match(worker, /getSignatureStatuses/);
  assert.match(worker, /lastValidBlockHeight/);
});

test("high-value claims support role-distinct approval quorum", () => {
  assert.match(governanceMigration, /reward_claim_approval_policies/);
  assert.match(governanceMigration, /reward_claim_approvals/);
  assert.match(governanceMigration, /UNIQUE\(claim_id,approver_role\)/);
  assert.match(claims, /CLAIM_SELF_APPROVAL_FORBIDDEN/);
  assert.match(claims, /required_approval_roles/);
  assert.match(claims, /approvedRoles\.has/);
  assert.match(server, /CLAIM_CLIENT_SCOPED_APPROVER_REQUIRED/);
});

test("evidence policies can require independent verifier classes", () => {
  assert.match(governanceMigration, /REVENUE_METER/);
  assert.match(governanceMigration, /verification_policy_class_requirements/);
  assert.match(evidence, /MANUAL_REVIEW/);
  assert.match(evidence, /Verifier independence requirement/);
  assert.match(server, /VERIFIER_CLASS_REQUIREMENT_UNSATISFIABLE/);
});

test("chain health validates deployment rather than only env syntax", () => {
  assert.match(chainHealth, /deriveProtocolPdas/);
  assert.match(chainHealth, /programExecutable/);
  assert.match(chainHealth, /stateVersionV1/);
  assert.match(chainHealth, /treasuryAuthorityMatches/);
  assert.match(chainHealth, /TOKEN_2022_PROGRAM_ID/);
  assert.match(server, /health\/chain/);
});
