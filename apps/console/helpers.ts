export function assertNever(
  value: never,
  message = "Unexpected value",
): never {
  throw new Error(`${message}: ${String(value)}`);
}

export function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export function compact<T>(
  values: readonly (T | null | undefined | false)[],
): T[] {
  return values.filter(Boolean) as T[];
}

export function safeReturnTo(
  value: string | null | undefined,
  fallback: string,
): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback;
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
