import { cookies } from "next/headers";

const backend = () =>
  (process.env.POWERCHAIN_MINER_API_URL ?? "http://localhost:3100").replace(/\/$/, "");

export async function consoleApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const jar = await cookies();
  const token = jar.get("powerchain_session")?.value;
  if (!token) throw Object.assign(new Error("UNAUTHENTICATED"), { status: 401 });

  const response = await fetch(`${backend()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw Object.assign(new Error(body || `API ${response.status}`), { status: response.status });
  }
  return response.json() as Promise<T>;
}
