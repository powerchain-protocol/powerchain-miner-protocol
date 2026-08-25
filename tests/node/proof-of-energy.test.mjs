import test from "node:test";
import assert from "node:assert/strict";
import { digestProof, qualityAdjustedWh, rewardBaseUnits, rewardFitsProtocolCeiling } from "../../utils/proof-of-energy.mjs";

test("quality-adjusted Wh uses integer arithmetic", () => {
  assert.equal(qualityAdjustedWh(1000, 9500), 950n);
});

test("proof digest is deterministic across object key order", () => {
  const a = { sequence: 1, energyDeltaWh: 25, qualityBps: 10000 };
  const b = { qualityBps: 10000, energyDeltaWh: 25, sequence: 1 };
  assert.equal(digestProof(a), digestProof(b));
});


import { readFile } from "node:fs/promises";
import { canonicalJson } from "../../utils/canonical-json.mjs";

test("cross-runtime fixture has stable canonical JSON and digest", async () => {
  const vector = JSON.parse(
    await readFile(new URL("../fixtures/proof-of-energy.vector.json", import.meta.url), "utf8"),
  );
  assert.equal(canonicalJson(vector.proof), vector.canonicalJson);
  assert.equal(digestProof(vector.proof), vector.sha256);
});


test("backend reward stays below protocol ceiling", () => {
  const reward = rewardBaseUnits(1000, 9500, 80, 1_000_000);
  assert.equal(reward, 76_000n);
  assert.equal(
    rewardFitsProtocolCeiling(reward, 1000, 9500, 100, 1_000_000),
    true,
  );
  assert.equal(
    rewardFitsProtocolCeiling(100_000, 1000, 9500, 100, 1_000_000),
    false,
  );
});
