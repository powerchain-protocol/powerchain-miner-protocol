import { createHash } from "node:crypto";

export function claimDiscriminator() {
  return createHash("sha256")
    .update("global:claim_rewards", "utf8")
    .digest()
    .subarray(0, 8);
}

export function uuidBytes(value) {
  const hex = String(value).replace(/-/g, "").toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(hex)) {
    throw new Error("Claim ID must be a UUID.");
  }
  return Buffer.from(hex, "hex");
}

export function encodeClaimInstruction({
  claimId,
  amountBaseUnits,
  expiresAtUnixSeconds,
}) {
  const amount = BigInt(amountBaseUnits);
  if (amount <= 0n || amount > 0xffff_ffff_ffff_ffffn) {
    throw new Error("Claim amount must fit u64.");
  }
  if (
    !Number.isSafeInteger(expiresAtUnixSeconds) ||
    expiresAtUnixSeconds <= 0
  ) {
    throw new Error("expiresAtUnixSeconds is invalid.");
  }

  const amountBytes = Buffer.alloc(8);
  amountBytes.writeBigUInt64LE(amount);

  const expiryBytes = Buffer.alloc(8);
  expiryBytes.writeBigInt64LE(BigInt(expiresAtUnixSeconds));

  return Buffer.concat([
    claimDiscriminator(),
    uuidBytes(claimId),
    amountBytes,
    expiryBytes,
  ]);
}

export function decodeClaimInstruction(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length !== 40) {
    throw new Error("Canonical claim instruction must be 40 bytes.");
  }

  return {
    discriminator: buffer.subarray(0, 8),
    claimIdBytes: buffer.subarray(8, 24),
    amountBaseUnits: buffer.readBigUInt64LE(24),
    expiresAtUnixSeconds: Number(buffer.readBigInt64LE(32)),
  };
}
