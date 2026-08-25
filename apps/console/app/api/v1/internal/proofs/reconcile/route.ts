import { NextResponse } from "next/server";
import { assertWorkerToken } from "@/lib/internal-auth";
import { mutateStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertWorkerToken(request);
    const body = await request.json() as {
      proofId?: string;
      chainStatus?: "submitted" | "confirmed" | "failed";
      chainSignature?: string;
      chainError?: string;
    };

    if (!body.proofId || !body.chainStatus) {
      return NextResponse.json({ error: "proofId and chainStatus are required." }, { status: 400 });
    }

    const updated = await mutateStore((state) => {
      const proof = state.proofs.find((p) => p.id === body.proofId);
      if (!proof) return false;
      proof.chainStatus = body.chainStatus;
      proof.chainSignature = body.chainSignature;
      proof.chainError = body.chainError;
      return true;
    });

    if (!updated) {
      return NextResponse.json({ error: "Proof not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: (error as Error & { status?: number }).status ?? 500 },
    );
  }
}
