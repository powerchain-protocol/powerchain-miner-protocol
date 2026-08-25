import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

async function source(path) {
  return readFile(path, "utf8");
}

test("canonical mining engine modules exist and are exported", async () => {
  for (const path of [
    "packages/powerchain-protocol/miner/src/system/index.ts",
    "packages/powerchain-protocol/miner/src/epoch/index.ts",
    "packages/powerchain-protocol/miner/src/rules/index.ts",
    "packages/powerchain-protocol/miner/src/mining-engine/index.ts",
    "packages/powerchain-protocol/miner/src/agents/rules.ts",
    "packages/powerchain-protocol/miner/src/pay/index.ts",
  ]) {
    await stat(path);
  }

  const index = await source(
    "packages/powerchain-protocol/miner/src/index.ts",
  );
  for (const module of [
    "epoch/index.js",
    "mining-engine/index.js",
    "pay/index.js",
    "rules/index.js",
    "system/index.js",
  ]) {
    assert.ok(index.includes(module), module);
  }
});

test("mining epochs are derived from observation time on-chain", async () => {
  const program = await source("programs/miner/src/lib.rs");
  const utils = await source("programs/miner/src/utils.rs");
  const proof = await source("programs/miner/src/proof_of_energy.rs");

  assert.match(
    program,
    /checked_epoch\(args\.observed_at, config\.epoch_seconds\)/,
  );
  assert.doesNotMatch(
    program,
    /checked_epoch\(now, config\.epoch_seconds\)/,
  );
  assert.match(utils, /timestamp < 0 \|\| epoch_seconds <= 0/);
  assert.match(proof, /MinerError::InvalidTimestamp/);
});

test("agent rules preserve authority boundaries", async () => {
  const rules = await source(
    "packages/powerchain-protocol/miner/src/agents/rules.ts",
  );
  for (const rule of [
    "NO_FABRICATED_PHYSICAL_TRUTH",
    "NO_PRIVATE_KEY_CUSTODY",
    "NO_SILENT_SETTLEMENT",
    "NO_POLICY_BYPASS",
    "NO_UNBOUNDED_COMPUTE_SPEND",
    "EVIDENCE_BEFORE_EXECUTION",
  ]) {
    assert.ok(rules.includes(rule), rule);
  }
});

test("Solana Pay and pay.sh helpers fail closed around payment execution", async () => {
  const pay = await source(
    "packages/powerchain-protocol/miner/src/pay/index.ts",
  );
  assert.match(pay, /solana:\$\{recipient\}/);
  assert.match(pay, /Paid API targets must use HTTPS/);
  assert.match(pay, /--sandbox/);
  assert.match(pay, /--local/);
  assert.match(pay, /--mainnet/);
  assert.doesNotMatch(pay, /--devnet/);
  assert.match(pay, /never shells out/i);
});

test("Miner npm package is distributable and token-free by design", async () => {
  const pkg = JSON.parse(
    await source(
      "packages/powerchain-protocol/miner/package.json",
    ),
  );
  assert.equal(pkg.name, "@powerchain-protocol/miner");
  assert.equal(pkg.version, "1.0.0");
  assert.equal(pkg.private, false);
  assert.equal(pkg.publishConfig.access, "public");
  assert.equal(pkg.exports["./mining-engine"].import,
    "./dist/mining-engine/index.js");
  assert.equal(pkg.exports["./pay"].import,
    "./dist/pay/index.js");
  assert.ok(pkg.files.includes("dist"));

  const workflow = await source(
    ".github/workflows/publish-miner.yml",
  );
  assert.match(workflow, /id-token: write/);
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN/);

  const publishScript = await source(
    "scripts/npm-publish-miner.sh",
  );
  assert.match(publishScript, /Refusing token-based npm publishing/);
  assert.match(publishScript, /already exists on npm/);
});

test("requested root skills are present", async () => {
  for (const path of [
    "skills/MINER.md",
    "skills/REWARDS.md",
    "skills/PAY.SH.md",
  ]) {
    const content = await source(path);
    assert.match(content, /^# /);
  }
});

test("bootstrap builds the canonical protocol package using Corepack pnpm", async () => {
  const bootstrap = await source("scripts/bootstrap-dev.sh");
  const ensure = await source("scripts/ensure-pnpm.sh");
  assert.match(ensure, /EXPECTED="11\.23\.0"/);
  assert.match(ensure, /corepack prepare "pnpm@\$EXPECTED" --activate/);
  assert.match(bootstrap, /PNPM=\(corepack pnpm\)/);
  assert.match(bootstrap, /--filter @powerchain-protocol\/miner build/);
});
