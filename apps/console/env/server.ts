function requiredUrl(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
}

export const serverEnv = {
  apiUrl: requiredUrl(
    "POWERCHAIN_MINER_API_URL",
    "http://localhost:3100",
  ),
  previewApiEnabled:
    process.env.POWERCHAIN_ENABLE_PREVIEW_API === "true",
} as const;
