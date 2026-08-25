import test from "node:test";
import assert from "node:assert/strict";
import {
  generateKeyPairSync,
  sign,
  verify,
} from "node:crypto";
import { canonicalJson } from "../../utils/canonical-json.mjs";
import {
  attestationDigest,
  canonicalAttestationPayload,
} from "../../utils/attestation.mjs";

const payload = canonicalAttestationPayload({
  proofId: "00000000-0000-4000-8000-000000000001",
  verifierRegistryId: "00000000-0000-4000-8000-000000000002",
  decision: "APPROVE",
  qualityBps: 9750,
  proofDigest: "a".repeat(64),
  sourceHash: "b".repeat(64),
});

test("attestation signature binds economically relevant fields", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const message = Buffer.from(canonicalJson(payload), "utf8");
  const signature = sign(null, message, privateKey);

  assert.equal(verify(null, message, publicKey, signature), true);

  const modified = Buffer.from(
    canonicalJson({ ...payload, qualityBps: 10000 }),
    "utf8",
  );
  assert.equal(verify(null, modified, publicKey, signature), false);
});

test("attestation digest is deterministic", () => {
  assert.match(attestationDigest(payload), /^[a-f0-9]{64}$/);
  assert.equal(attestationDigest(payload), attestationDigest({ ...payload }));
});
