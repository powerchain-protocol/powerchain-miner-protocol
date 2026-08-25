import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const required = [
  "apps/backend/package.json",
  "apps/backend/src/api/v1/index.ts",
  "apps/console/package.json",
  "apps/compute/package.json",
  "apps/compute/openapi.yaml",
  "apps/frontend/package.json",
  "apps/frontend/components/PWA.tsx",
  "apps/frontend/components/sections/HeroSection.tsx",
  "apps/frontend/components/sections/FeatureGrid.tsx",
  "apps/mobile/package.json",
  "apps/mobile/App.tsx",
  "packages/agent-compute/package.json",
  "packages/api-client/package.json",
  "packages/design-system/src/tokens.ts",
  "docs/DESIGN-GUIDE.md",
];

test("canonical v1.0.0 product monorepo is present", async () => {
  for (const path of required) {
    await access(path);
  }
});

test("legacy app folder names are no longer canonical package paths", async () => {
  const root = JSON.parse(await readFile("package.json", "utf8"));
  const scripts = JSON.stringify(root.scripts);
  assert.equal(scripts.includes("@powerchain/miner-web"), false);
  assert.equal(scripts.includes("@powerchain/miner-api"), false);
  assert.equal(scripts.includes("@powerchain/console"), true);
  assert.equal(scripts.includes("@powerchain/backend"), true);
});

test("Expo mobile is pinned to stable SDK 57 / React Native 0.86 line", async () => {
  const mobile = JSON.parse(
    await readFile("apps/mobile/package.json", "utf8"),
  );
  assert.equal(mobile.dependencies.expo, "57.0.16");
  assert.equal(mobile.dependencies["react-native"], "0.86.3");
});

test("marketing PWA does not cache API responses", async () => {
  const worker = await readFile(
    "apps/frontend/public/sw.js",
    "utf8",
  );
  assert.match(worker, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /request\.mode === "navigate"/);
});
