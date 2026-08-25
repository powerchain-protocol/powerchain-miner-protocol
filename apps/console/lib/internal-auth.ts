import { timingSafeEqual } from "node:crypto";

export function assertWorkerToken(request: Request) {
  const expected = process.env.POWERCHAIN_WORKER_TOKEN;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!expected || expected.length < 24 || !provided) {
    throw Object.assign(new Error("Unauthorized worker."), { status: 401 });
  }

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw Object.assign(new Error("Unauthorized worker."), { status: 401 });
  }
}
