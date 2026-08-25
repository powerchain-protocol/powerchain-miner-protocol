export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const expected = new URL(request.url).origin;
  if (origin !== expected) {
    throw Object.assign(new Error("Cross-origin state change rejected."), {
      status: 403,
    });
  }
}
