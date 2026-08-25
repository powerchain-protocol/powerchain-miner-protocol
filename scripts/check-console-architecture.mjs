import {
  readFile,
  readdir,
  stat,
} from "node:fs/promises";
import { join } from "node:path";

const root = "apps/console";

const required = [
  "lib/chains/index.ts",
  "lib/chains/solana.ts",
  "lib/chains/sui.ts",
  "lib/chains/transactions.ts",
  "lib/core/index.ts",
  "lib/market-data/index.ts",
  "lib/wallets/index.ts",
  "lib/client/index.ts",
  "lib/server/index.ts",
  "lib/index.ts",
  "components/index.ts",
  "components/ui/index.ts",
  "data/index.ts",
  "types/index.ts",
  "utils/index.ts",
];

for (const rel of required) {
  await stat(join(root, rel));
}

const deprecatedImportPatterns = [
  /from\s+["']@\/lib\/solana["']/,
  /from\s+["']@\/lib\/sui["']/,
  /from\s+["']@\/lib\/blockchain["']/,
  /from\s+["']@\/lib\/transactions["']/,
  /from\s+["']@\/lib\/birdeye["']/,
  /from\s+["']@\/lib\/pyth["']/,
  /from\s+["']@\/lib\/embedded-wallets["']/,
  /from\s+["']@\/lib\/queries["']/,
  /from\s+["']@\/lib\/rate-limiter["']/,
  /from\s+["']@\/lib\/safe-actions["']/,
  /from\s+["']@\/hooks\/use-subsriptions["']/,
  /from\s+["']@\/types\/subsribe["']/,
];

const compatibilityFiles = new Set([
  "ai.ts",
  "analytics.ts",
  "blockchain.ts",
  "birdeye.ts",
  "pyth.ts",
  "queries.ts",
  "solana.ts",
  "sui.ts",
  "transactions.ts",
  "lib/solana.ts",
  "lib/sui.ts",
  "lib/blockchain.ts",
  "lib/transactions.ts",
  "lib/birdeye.ts",
  "lib/pyth.ts",
  "lib/embedded-wallets.ts",
  "lib/queries.ts",
  "lib/rate-limiter.ts",
  "lib/safe-actions.ts",
  "hooks/use-subsriptions.ts",
  "types/subsribe.ts",
]);

const clientForbidden = [
  "@/env/server",
  "@/lib/server",
  "@/lib/market-data",
  "@/lib/birdeye",
  "@/lib/pyth",
];

async function walk(dir) {
  const entries = await readdir(dir, {
    withFileTypes: true,
  });

  const files = [];
  for (const entry of entries) {
    if (["node_modules", ".next"].includes(entry.name)) {
      continue;
    }

    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(path));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

const files = await walk(root);
const failures = [];

for (const file of files) {
  const rel = file
    .slice(root.length + 1)
    .replaceAll("\\", "/");
  const source = await readFile(file, "utf8");

  if (!compatibilityFiles.has(rel)) {
    for (const pattern of deprecatedImportPatterns) {
      if (pattern.test(source)) {
        failures.push(
          `${rel}: imports deprecated compatibility path ${pattern}`,
        );
      }
    }
  }

  const trimmed = source.trimStart();
  const isClient =
    trimmed.startsWith('"use client"') ||
    trimmed.startsWith("'use client'");

  if (isClient) {
    for (const forbidden of clientForbidden) {
      if (source.includes(forbidden)) {
        failures.push(
          `${rel}: client component imports server-only boundary ${forbidden}`,
        );
      }
    }
  }
}

const misspelledHook = await readFile(
  join(root, "hooks/use-subsriptions.ts"),
  "utf8",
);
if (!/@deprecated/.test(misspelledHook)) {
  failures.push(
    "hooks/use-subsriptions.ts must remain a deprecated compatibility facade",
  );
}

const misspelledType = await readFile(
  join(root, "types/subsribe.ts"),
  "utf8",
);
if (!/@deprecated/.test(misspelledType)) {
  failures.push(
    "types/subsribe.ts must remain a deprecated compatibility facade",
  );
}

if (failures.length) {
  throw new Error(
    `Console architecture violations:\n- ${failures.join("\n- ")}`,
  );
}

console.log(
  `Console architecture: ${files.length} TS/TSX files follow domain/import boundaries`,
);
