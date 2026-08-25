import test from "node:test";
import assert from "node:assert/strict";
import {
  claimDiscriminator,
  decodeClaimInstruction,
  encodeClaimInstruction,
  uuidBytes,
} from "../../utils/claim-instruction.mjs";

test("canonical claim instruction encodes Anchor args exactly", () => {
  const claimId = "123e4567-e89b-12d3-a456-426614174000";
  const encoded = encodeClaimInstruction({
    claimId,
    amountBaseUnits: "18446000000",
    expiresAtUnixSeconds: 1_800_000_000,
  });

  assert.equal(encoded.length, 40);

  const decoded = decodeClaimInstruction(encoded);
  assert.deepEqual(decoded.discriminator, claimDiscriminator());
  assert.deepEqual(decoded.claimIdBytes, uuidBytes(claimId));
  assert.equal(decoded.amountBaseUnits, 18_446_000_000n);
  assert.equal(decoded.expiresAtUnixSeconds, 1_800_000_000);
});

test("claim UUID deterministically produces a 16-byte PDA seed", () => {
  assert.equal(
    uuidBytes("00000000-0000-4000-8000-000000000001").length,
    16,
  );
});

test("claim amount rejects values outside Solana u64", () => {
  assert.throws(() =>
    encodeClaimInstruction({
      claimId: "00000000-0000-4000-8000-000000000001",
      amountBaseUnits: "18446744073709551616",
      expiresAtUnixSeconds: 1_800_000_000,
    }),
  );
});
