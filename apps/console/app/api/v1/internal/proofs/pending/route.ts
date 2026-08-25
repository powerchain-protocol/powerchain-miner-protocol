import { NextResponse } from "next/server";
import { assertWorkerToken } from "@/lib/internal-auth";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    assertWorkerToken(request);
    const state = await readStore();
    return NextResponse.json({
      proofs: state.proofs.filter((p) => p.status === "verified" && (p.chainStatus ?? "pending") === "pending").slice(0, 25),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: (error as Error & { status?: number }).status ?? 500 },
    );
  }
}
