import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  "apps/backend/migrations/007_v100_economic_invariants.sql",
  "utf8",
);
const program = await readFile(
  "programs/miner/src/lib.rs",
  "utf8",
);
const state = await readFile(
  "programs/miner/src/state.rs",
  "utf8",
);

test("v1 database freezes ambiguous reward economics", () => {
  for (const required of [
    "reward_policies_no_active_overlap",
    "reward_epochs_no_active_overlap",
    "trg_reward_ledger_immutable",
    "reward_ledger_entry_semantics",
  ]) {
    assert.ok(migration.includes(required), required);
  }
});

test("v1 audit records and checkpoints are append-only", () => {
  assert.ok(migration.includes("trg_audit_logs_immutable"));
  assert.ok(migration.includes("trg_audit_checkpoints_immutable"));
});

test("v1 claim uses short-lived one-time on-chain receipt", () => {
  assert.ok(program.includes("claim_id: [u8; 16]"));
  assert.ok(program.includes("expires_at: i64"));
  assert.ok(program.includes("MAX_CLAIM_AUTHORIZATION_SECS"));
  assert.ok(state.includes("pub struct ClaimReceipt"));
  assert.ok(state.includes("authorization_expires_at"));
});


test("v1 device ownership changes require explicit on-chain reassignment", () => {
  assert.ok(program.includes("pub fn reassign_device"));
  assert.ok(program.includes("DeviceReassigned"));
});
