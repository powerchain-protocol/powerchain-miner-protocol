import { NextResponse } from "next/server";
import { consoleApi } from "@/lib/console-api";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      await consoleApi(
        `/api/v1/clients/${encodeURIComponent(clientId)}/members`,
      ),
    );
  } catch (error) {
    const status =
      (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: (error as Error).message },
      { status },
    );
  }
}
