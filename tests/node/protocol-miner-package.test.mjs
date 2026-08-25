import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pkg = JSON.parse(
  await readFile(
    "packages/powerchain-protocol/miner/package.json",
    "utf8",
  ),
);
const constants = await readFile(
  "packages/powerchain-protocol/miner/src/constants.ts",
  "utf8",
);
const rustConstants = await readFile(
  "programs/miner/src/constants.rs",
  "utf8",
);
const math = await readFile(
  "packages/powerchain-protocol/miner/src/math.ts",
  "utf8",
);
const sdkIndex = await readFile(
  "packages/miner-sdk/src/index.ts",
  "utf8",
);
const backendRewards = await readFile(
  "apps/backend/src/domain/rewards.ts",
  "utf8",
);
const workspace = await readFile(
  "pnpm-workspace.yaml",
  "utf8",
);

test("canonical miner protocol package has the requested identity", () => {
  assert.equal(pkg.name, "@powerchain-protocol/miner");
  assert.equal(pkg.version, "1.0.0");
  assert.equal(pkg.private, true);
  assert.match(workspace, /packages\/\*\/\*/);
});

test("TypeScript PDA seeds remain aligned with the Anchor program", () => {
  const seedPairs = [
    ["protocol", "PROTOCOL_SEED"],
    ["treasury-authority", "TREASURY_AUTHORITY_SEED"],
    ["treasury-vault", "TREASURY_VAULT_SEED"],
    ["miner", "MINER_SEED"],
    ["device", "DEVICE_SEED"],
    ["claim-receipt", "CLAIM_RECEIPT_SEED"],
  ];

  for (const [value, rustName] of seedPairs) {
    assert.ok(constants.includes(`"${value}"`), value);
    assert.match(
      rustConstants,
      new RegExp(`${rustName}: &\\[u8\\] = b"${value}"`),
    );
  }
});

test("protocol package owns canonical integer reward math", () => {
  assert.match(math, /BPS_DENOMINATOR/);
  assert.match(math, /effectiveEnergyWh/);
  assert.match(math, /calculateProtocolRewardCeiling/);
  assert.match(math, /calculateReward/);
  assert.match(math, /minimumQuality/);
});

test("miner SDK and backend consume the protocol package", () => {
  assert.match(
    sdkIndex,
    /export \* from "@powerchain-protocol\/miner"/,
  );
  assert.match(
    backendRewards,
    /from "@powerchain-protocol\/miner"/,
  );
});
