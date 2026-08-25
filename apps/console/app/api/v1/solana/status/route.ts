import { NextResponse } from "next/server";
import { network } from "@/lib/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rpc = process.env.POWERCHAIN_SOLANA_RPC_URL;
  if (!rpc) {
    return NextResponse.json({
      ok: false,
      network: network(),
      error: "POWERCHAIN_SOLANA_RPC_URL is not configured.",
    }, { status: 503 });
  }

  try {
    const response = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
      cache: "no-store",
    });

    const body = await response.json();
    return NextResponse.json({
      ok: response.ok && body?.result === "ok",
      network: network(),
      rpcHealthy: body?.result === "ok",
      programId: process.env.POWERCHAIN_MINER_PROGRAM_ID || null,
      minerMint: process.env.POWERCHAIN_MINER_MINT || null,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      network: network(),
      error: (error as Error).message,
    }, { status: 503 });
  }
}
