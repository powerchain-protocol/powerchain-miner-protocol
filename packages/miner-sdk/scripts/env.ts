import { readFile } from "node:fs/promises";

export async function readEnvFile(path?: string) {
  if (!path) return { ...process.env } as Record<string, string>;

  const text = await readFile(path, "utf8");
  const values: Record<string, string> = {};

  for (const line of text.split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith("#") || !value.includes("=")) {
      continue;
    }
    const index = value.indexOf("=");
    values[value.slice(0, index).trim()] =
      value.slice(index + 1).trim();
  }

  return {
    ...values,
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string",
      ),
    ),
  };
}

export function required(
  env: Record<string, string>,
  ...names: string[]
) {
  for (const name of names) {
    if (env[name]) return env[name];
  }
  throw new Error(`Missing required value: ${names.join(" or ")}`);
}

export function bigintValue(
  env: Record<string, string>,
  ...names: string[]
) {
  return BigInt(required(env, ...names));
}

export function numberValue(
  env: Record<string, string>,
  ...names: string[]
) {
  const value = Number(required(env, ...names));
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value: ${names.join(" or ")}`);
  }
  return value;
}
