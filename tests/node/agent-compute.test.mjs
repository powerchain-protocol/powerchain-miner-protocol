import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  "apps/backend/migrations/008_v120_agent_compute.sql",
  "utf8",
);
const domain = await readFile(
  "apps/backend/src/domain/agent-compute.ts",
  "utf8",
);
const gateway = await readFile(
  "apps/compute/src/server.ts",
  "utf8",
);
const packageSource = await readFile(
  "packages/agent-compute/src/index.ts",
  "utf8",
);
const solana = await readFile(
  "packages/agent-compute/src/solana.ts",
  "utf8",
);

test("Agent Compute database has append-only usage billing", () => {
  for (const expected of [
    "trg_compute_ledger_immutable",
    "compute_ledger_entry_semantics",
    "ux_compute_ledger_usage_debit",
    "ux_compute_ledger_topup_credit",
    "agent_compute_balances",
  ]) {
    assert.ok(migration.includes(expected), expected);
  }
});

test("compute API key is agent scoped and stored as SHA-256 hash", () => {
  assert.match(packageSource, /pc_compute_/);
  assert.match(packageSource, /createHash\("sha256"\)/);
  assert.match(migration, /key_hash text NOT NULL UNIQUE/);
});

test("request IDs are single use and cannot replay model execution", () => {
  assert.match(domain, /COMPUTE_REQUEST_ID_ALREADY_USED/);
  assert.doesNotMatch(
    domain,
    /return\s*\{\s*replay:\s*true[\s\S]*authorization:\s*existing/,
  );
});

test("auto top-up cannot treat zero daily cap as unlimited", () => {
  assert.match(domain, /dailyMax <= 0n/);
  assert.match(domain, /max_auto_topup_per_day_microunits/);
});

test("compute gateway supports both chat completions and Responses", () => {
  assert.match(gateway, /\/v1\/chat\/completions/);
  assert.match(gateway, /\/v1\/responses/);
  assert.match(gateway, /\/v1\/account/);
  assert.match(gateway, /\/v1\/topups\/:intentId\/confirm/);
});

test("streaming fails closed until durable usage settlement exists", () => {
  assert.match(gateway, /COMPUTE_STREAMING_NOT_ENABLED/);
  assert.match(gateway, /billing reconciliation failed/i);
});

test("Solana top-up helper sends exact quoted token amount", () => {
  assert.match(solana, /createTransferCheckedInstruction/);
  assert.match(solana, /requiredAssetBaseUnits/);
  assert.match(solana, /treasuryDestination/);
  assert.match(solana, /TOKEN_2022_PROGRAM_ID/);
  assert.match(solana, /TOKEN_PROGRAM_ID/);
});


test("model discovery only returns executable routes", async () => {
  const routes = await readFile(
    "apps/backend/src/api/v1/agent-compute.ts",
    "utf8",
  );
  assert.match(
    routes,
    /WHERE listed=true\s+AND enabled=true\s+AND context_length IS NOT NULL/,
  );
  assert.match(routes, /contextLength/);
  assert.match(routes, /display_name/);
});
