import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile =
  process.env.POWERCHAIN_ENV_FILE?.trim() ||
  resolve("apps/backend/.env");

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}
