import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/constants/session";
import { serverEnv } from "@/env/server";

export async function consoleApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    throw Object.assign(new Error("UNAUTHENTICATED"), { status: 401 });
  }

  const response = await fetch(`${serverEnv.apiUrl}${path}`, {
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
    throw Object.assign(
      new Error(body || `API ${response.status}`),
      { status: response.status },
    );
  }

  return response.json() as Promise<T>;
}
