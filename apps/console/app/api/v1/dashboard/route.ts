import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { network } from "@/lib/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readStore();
  const now = Date.now();

  const devices = state.devices.map((device) => {
    const lastSeen = device.lastSeenAt ? Date.parse(device.lastSeenAt) : 0;
    const status = lastSeen && now - lastSeen < 90_000 ? "online" : "offline";
    return { ...device, status };
  });

  const totalEnergyWh = devices.reduce((sum, d) => sum + d.totalEnergyWh, 0);
  const totalRewardBaseUnits = devices.reduce((sum, d) => sum + d.totalRewardBaseUnits, 0);

  return NextResponse.json({
    network: network(),
    simulated: devices.length === 0,
    metrics: {
      activeNodes: devices.filter((d) => d.status === "online").length,
      totalNodes: devices.length,
      verifiedEnergyKwh: totalEnergyWh / 1000,
      totalRewardBaseUnits,
      proofCount: state.proofs.length,
    },
    devices: devices.slice(0, 50),
    proofs: state.proofs.slice(0, 20),
  });
}
