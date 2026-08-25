import { createHash } from "node:crypto";
import { canonicalJson } from "./canonical-json.mjs";

export function digestProof(proof) {
  return createHash("sha256").update(canonicalJson(proof), "utf8").digest("hex");
}

export function qualityAdjustedWh(energyWh, qualityBps) {
  if (!Number.isSafeInteger(energyWh) || energyWh <= 0) throw new Error("invalid energyWh");
  if (!Number.isSafeInteger(qualityBps) || qualityBps < 1 || qualityBps > 10_000) {
    throw new Error("invalid qualityBps");
  }
  return (BigInt(energyWh) * BigInt(qualityBps)) / 10_000n;
}


export function rewardBaseUnits(energyWh, qualityBps, baseUnitsPerWh, maxPerProof) {
  const effective = qualityAdjustedWh(energyWh, qualityBps);
  let reward = effective * BigInt(baseUnitsPerWh);
  const max = BigInt(maxPerProof);
  if (reward > max) reward = max;
  return reward;
}

export function rewardFitsProtocolCeiling(
  reward,
  energyWh,
  qualityBps,
  protocolMaxBaseUnitsPerWh,
  maxPerProof,
) {
  const ceiling = rewardBaseUnits(
    energyWh,
    qualityBps,
    protocolMaxBaseUnitsPerWh,
    maxPerProof,
  );
  return BigInt(reward) <= ceiling;
}
