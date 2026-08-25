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

function optionalUrl(name: string, fallback: string) {
  return requiredUrl(name, fallback);
}

export const serverEnv = {
  apiUrl: requiredUrl(
    "POWERCHAIN_MINER_API_URL",
    "http://localhost:3100",
  ),
  previewApiEnabled:
    process.env.POWERCHAIN_ENABLE_PREVIEW_API === "true",
  birdeyeApiUrl: optionalUrl(
    "BIRDEYE_API_URL",
    "https://public-api.birdeye.so",
  ),
  birdeyeApiKey:
    process.env.BIRDEYE_API_KEY?.trim() || null,
  pythHermesUrl: optionalUrl(
    "PYTH_HERMES_URL",
    "https://pyth.dourolabs.app/hermes",
  ),
  pythApiKey:
    process.env.PYTH_API_KEY?.trim() || null,
} as const;
