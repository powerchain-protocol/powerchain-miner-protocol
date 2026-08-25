import { NextResponse } from "next/server";
import { consoleApi } from "@/lib/console-api";

export async function GET() {
  try {
    return NextResponse.json(
      await consoleApi("/api/v1/auth/me"),
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
