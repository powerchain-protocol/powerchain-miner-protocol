import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/same-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const backend = (process.env.POWERCHAIN_MINER_API_URL ?? "http://localhost:3100").replace(/\/$/, "");
  const body = await request.text();

  const response = await fetch(`${backend}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  const out = NextResponse.json({ ok: true, user: payload.user });
  out.cookies.set("powerchain_session", payload.token, {
    httpOnly: true,
    sameSite: "strict",
    priority: "high",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return out;
}
