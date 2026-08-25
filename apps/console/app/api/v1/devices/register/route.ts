import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { assertBootstrapToken } from "@/lib/auth";
import { getDevice, upsertDevice } from "@/lib/store";
import type { Device } from "@/lib/types";
import { requirePreviewApi } from "@/lib/preview-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const disabled = requirePreviewApi();
  if (disabled) return disabled;
  try {
    assertBootstrapToken(request);
    const body = await request.json() as Partial<Device> & { publicKeyPem?: string };

    if (!body.id || !body.publicKeyPem || !body.label || !body.renewableType) {
      return NextResponse.json({ error: "Missing device enrollment fields." }, { status: 400 });
    }

    const existing = await getDevice(body.id);
    if (existing && existing.publicKeyPem !== body.publicKeyPem) {
      return NextResponse.json(
        { error: "Device ID already exists with a different signing key." },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const device: Device = {
      id: body.id,
      publicKeyPem: body.publicKeyPem,
      label: body.label,
      renewableType: body.renewableType,
      source: body.source ?? "unknown",
      model: body.model,
      firmware: body.firmware ?? "0.1.0",
      registeredAt: existing?.registeredAt ?? now,
      lastSeenAt: existing?.lastSeenAt ?? null,
      status: existing?.status ?? "offline",
      totalEnergyWh: existing?.totalEnergyWh ?? 0,
      totalRewardBaseUnits: existing?.totalRewardBaseUnits ?? 0,
      lastSequence: existing?.lastSequence ?? 0,
    };

    await upsertDevice(device);

    const fingerprint = createHash("sha256")
      .update(body.publicKeyPem)
      .digest("hex")
      .slice(0, 16);

    return NextResponse.json({
      ok: true,
      deviceId: device.id,
      fingerprint,
      protocol: "powerchain-renewable-proof/1",
    });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
