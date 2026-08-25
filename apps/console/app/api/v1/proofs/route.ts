import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyDeviceSignature } from "@/lib/auth";
import { getDevice, mutateStore } from "@/lib/store";
import { maxProofWh, network, rewardPerWhBaseUnits } from "@/lib/runtime";
import type { Proof } from "@/lib/types";
import { requirePreviewApi } from "@/lib/preview-api";

export const runtime = "nodejs";

type ProofPayload = {
  sequence: number;
  observedAt: string;
  renewableType: "solar" | "wind" | "hydro" | "battery" | "ev" | "other";
  energyDeltaWh: number;
  averagePowerW: number;
  sampleCount: number;
  source: string;
  previousDigest?: string;
};

export async function POST(request: Request) {
  const disabled = requirePreviewApi();
  if (disabled) return disabled;
  const raw = await request.text();
  const deviceId = request.headers.get("x-powerchain-device");
  const signature = request.headers.get("x-powerchain-signature") ?? "";

  if (!deviceId) {
    return NextResponse.json({ error: "Missing device ID." }, { status: 400 });
  }

  const device = await getDevice(deviceId);
  if (!device) {
    return NextResponse.json({ error: "Device is not enrolled." }, { status: 404 });
  }

  if (!verifyDeviceSignature(device.publicKeyPem, request, raw)) {
    return NextResponse.json({ error: "Invalid device signature." }, { status: 401 });
  }

  let payload: ProofPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!Number.isSafeInteger(payload.sequence) || payload.sequence <= device.lastSequence) {
    return NextResponse.json({ error: "Proof sequence is stale or invalid." }, { status: 409 });
  }
  if (!Number.isSafeInteger(payload.energyDeltaWh) || payload.energyDeltaWh <= 0) {
    return NextResponse.json({ error: "energyDeltaWh must be a positive integer." }, { status: 400 });
  }
  if (payload.energyDeltaWh > maxProofWh()) {
    return NextResponse.json({ error: "Proof exceeds configured energy limit." }, { status: 400 });
  }
  if (payload.renewableType !== device.renewableType) {
    return NextResponse.json({ error: "Renewable type does not match enrollment." }, { status: 400 });
  }

  const observedAt = Date.parse(payload.observedAt);
  if (!Number.isFinite(observedAt) || Math.abs(Date.now() - observedAt) > 15 * 60 * 1000) {
    return NextResponse.json({ error: "Proof observation timestamp is outside the accepted window." }, { status: 400 });
  }

  const digest = createHash("sha256").update(raw, "utf8").digest("hex");
  const rewardBaseUnits = payload.energyDeltaWh * rewardPerWhBaseUnits();

  if (!Number.isSafeInteger(rewardBaseUnits)) {
    return NextResponse.json({ error: "Reward arithmetic overflow." }, { status: 400 });
  }

  const proof: Proof = {
    id: randomUUID(),
    deviceId,
    sequence: payload.sequence,
    observedAt: payload.observedAt,
    receivedAt: new Date().toISOString(),
    renewableType: payload.renewableType,
    energyDeltaWh: payload.energyDeltaWh,
    averagePowerW: payload.averagePowerW,
    sampleCount: payload.sampleCount,
    source: payload.source,
    proofDigest: digest,
    signature,
    rewardBaseUnits,
    status: "verified",
    chainStatus: "pending",
    network: network(),
  };

  await mutateStore((state) => {
    const target = state.devices.find((d) => d.id === deviceId);
    if (!target) throw new Error("Device disappeared during proof processing.");

    // Defense-in-depth after serialized store read.
    if (payload.sequence <= target.lastSequence) {
      throw Object.assign(new Error("Proof sequence already accepted."), { status: 409 });
    }

    target.lastSequence = payload.sequence;
    target.totalEnergyWh += payload.energyDeltaWh;
    target.totalRewardBaseUnits += rewardBaseUnits;
    target.lastSeenAt = proof.receivedAt;
    target.status = "online";
    state.proofs.unshift(proof);
    state.proofs = state.proofs.slice(0, 5000);
  });

  return NextResponse.json({
    ok: true,
    proofId: proof.id,
    digest,
    rewardBaseUnits,
    network: proof.network,
  });
}
