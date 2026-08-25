import { NextResponse } from "next/server";
import { consoleApi } from "@/lib/console-api";
import { assertSameOrigin } from "@/lib/same-origin";

export async function POST(
  request: Request,
  context: { params: Promise<{ claimId: string }> },
) {
  assertSameOrigin(request);
  const { claimId } = await context.params;
  const body = await request.json();

  try {
    const result = await consoleApi(
      `/api/v1/reward-claims/${claimId}/settled`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: (error as Error).message },
      { status },
    );
  }
}
