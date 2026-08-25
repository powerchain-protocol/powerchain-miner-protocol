import { NextResponse } from "next/server";
import { verifyDeviceSignature } from "@/lib/auth";
import { getDevice, mutateStore } from "@/lib/store";
import { requirePreviewApi } from "@/lib/preview-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const disabled = requirePreviewApi();
  if (disabled) return disabled;
  const raw = await request.text();
  const deviceId = request.headers.get("x-powerchain-device");
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

  let payload: {
    temperatureC?: number;
    cpuPercent?: number;
    firmware?: string;
    ip?: string;
  };

  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const now = new Date().toISOString();
  await mutateStore((state) => {
    const target = state.devices.find((d) => d.id === deviceId);
    if (!target) return;
    target.lastSeenAt = now;
    target.status = "online";
    target.temperatureC = payload.temperatureC;
    target.cpuPercent = payload.cpuPercent;
    target.firmware = payload.firmware ?? target.firmware;
    target.ip = payload.ip;
  });

  return NextResponse.json({ ok: true, serverTime: now });
}
