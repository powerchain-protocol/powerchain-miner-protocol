import { NextResponse } from "next/server";

export function requirePreviewApi() {
  if (process.env.POWERCHAIN_ENABLE_PREVIEW_API === "true") return null;
  return NextResponse.json(
    {
      error:
        "The Next.js preview ingestion API is disabled. Configure Raspberry Pi nodes against apps/backend.",
    },
    { status: 410 },
  );
}
