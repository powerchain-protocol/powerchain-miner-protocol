import { NextResponse } from "next/server";
import { consoleApi } from "@/lib/console-api";
import { assertSameOrigin } from "@/lib/same-origin";

export async function POST(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  assertSameOrigin(request);
  const { clientId } = await context.params;
  const body = await request.json();

  try {
    const result = await consoleApi<{
      apiKey: string;
      record: { id: string; name: string; key_prefix: string };
      warning: string;
    }>(`/api/v1/clients/${clientId}/device-keys`, {
      method: "POST",
      body: JSON.stringify({ name: body.name }),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: (error as Error & { status?: number }).status ?? 500 },
    );
  }
}
