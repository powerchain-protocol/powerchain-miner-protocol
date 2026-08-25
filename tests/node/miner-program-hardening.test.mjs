import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const lib = await readFile("programs/miner/src/lib.rs", "utf8");
const helpers = await readFile("programs/miner/src/helpers.rs", "utf8");
const errors = await readFile("programs/miner/src/errors.rs", "utf8");
const events = await readFile("programs/miner/src/events.rs", "utf8");
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const ensurePnpm = await readFile("scripts/ensure-pnpm.sh", "utf8");

 test("Corepack activates canonical pnpm 11.23.0", () => {
  assert.equal(pkg.packageManager, "pnpm@11.23.0");
  assert.match(ensurePnpm, /EXPECTED="11\.23\.0"/);
  assert.match(ensurePnpm, /corepack prepare "pnpm@\$EXPECTED" --activate/);
  assert.match(ensurePnpm, /corepack pnpm --version/);
});

test("Miner program checks v1 account state before mutable operations", () => {
  assert.match(helpers, /assert_state_version/);
  assert.match(errors, /UnsupportedStateVersion/);
  assert.ok((lib.match(/assert_state_version\(/g) ?? []).length >= 9);
});

test("Miner rejects default critical identities", () => {
  assert.match(errors, /InvalidVerifier/);
  assert.match(errors, /InvalidDeviceSigningKey/);
  assert.match(errors, /InvalidAuthority/);
  assert.match(lib, /args\.verifier != Pubkey::default\(\)/);
  assert.match(lib, /device_signing_key != Pubkey::default\(\)/);
  assert.match(lib, /pending_authority != Pubkey::default\(\)/);
});

test("pending authority transfer can be cancelled", () => {
  assert.match(lib, /pub fn cancel_authority_transfer/);
  assert.match(events, /AuthorityProposalCancelled/);
});

test("verifier rotation event records old and new identities", () => {
  assert.match(events, /previous_verifier: Pubkey/);
  assert.match(lib, /let previous_verifier = ctx\.accounts\.config\.verifier/);
});
