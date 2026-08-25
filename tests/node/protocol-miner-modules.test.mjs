import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  readFile,
} from "node:fs/promises";

const base = "packages/powerchain-protocol/miner";
const pkg = JSON.parse(
  await readFile(`${base}/package.json`, "utf8"),
);

const modules = [
  ["./api/v1", "src/api/v1/index.ts", "dist/api/v1/index.js"],
  ["./cors", "src/cors/index.ts", "dist/cors/index.js"],
  ["./core", "src/core/index.ts", "dist/core/index.js"],
  ["./nodes", "src/nodes/index.ts", "dist/nodes/index.js"],
  ["./depin", "src/depin/index.ts", "dist/depin/index.js"],
  ["./solana", "src/solana/index.ts", "dist/solana/index.js"],
  ["./helius", "src/helius/index.ts", "dist/helius/index.js"],
  ["./iot", "src/iot/index.ts", "dist/iot/index.js"],
  ["./iot/devices", "src/iot/devices/index.ts", "dist/iot/devices/index.js"],
  ["./iot/hardwares", "src/iot/hardwares/index.ts", "dist/iot/hardwares/index.js"],
  ["./iot/firmwares", "src/iot/firmwares/index.ts", "dist/iot/firmwares/index.js"],
  ["./compute", "src/compute/index.ts", "dist/compute/index.js"],
  ["./ai", "src/ai/index.ts", "dist/ai/index.js"],
  ["./ai/llm", "src/ai/llm/index.ts", "dist/ai/llm/index.js"],
  ["./ai/mpc", "src/ai/mpc/index.ts", "dist/ai/mpc/index.js"],
  ["./agents", "src/agents/index.ts", "dist/agents/index.js"],
  ["./skills", "src/skills/index.ts", "dist/skills/index.js"],
  ["./system", "src/system/index.ts", "dist/system/index.js"],
  ["./epoch", "src/epoch/index.ts", "dist/epoch/index.js"],
  ["./rules", "src/rules/index.ts", "dist/rules/index.js"],
  ["./mining-engine", "src/mining-engine/index.ts", "dist/mining-engine/index.js"],
  ["./pay", "src/pay/index.ts", "dist/pay/index.js"],
];

test("canonical protocol package exposes all requested modules", async () => {
  for (const [subpath, sourceFile, distFile] of modules) {
    assert.equal(
      pkg.exports[subpath].import,
      `./${distFile}`,
    );
    assert.equal(
      pkg.exports[subpath].types,
      `./${distFile.replace(/\.js$/, ".d.ts")}`,
    );
    await access(`${base}/${sourceFile}`);
  }
  await access(`${base}/skills/SKILLS.md`);
  await access(`${base}/CHARACTERS.md`);
});

test("api v1 contract keeps the canonical prefix and requested namespaces", async () => {
  const source = await readFile(
    `${base}/src/api/v1/index.ts`,
    "utf8",
  );
  assert.match(source, /API_V1_PREFIX = "\/api\/v1"/);
  for (const namespace of [
    "core",
    "nodes",
    "depin",
    "solana",
    "helius",
    "iot",
    "devices",
    "hardwares",
    "firmwares",
    "compute",
    "ai",
    "llm",
    "mpc",
    "agents",
    "skills",
  ]) {
    assert.match(source, new RegExp(`${namespace}:`));
  }
});

test("MPC is model predictive control and cannot directly approve execution", async () => {
  const source = await readFile(
    `${base}/src/ai/mpc/index.ts`,
    "utf8",
  );
  assert.match(source, /Model Predictive Control/);
  assert.match(source, /REVIEW_REQUIRED/);
  assert.match(source, /execution-layer concern/);
});

test("backend consumes canonical API prefix, CORS and device transition policy", async () => {
  const api = await readFile(
    "apps/backend/src/api/v1/index.ts",
    "utf8",
  );
  const server = await readFile(
    "apps/backend/src/server.ts",
    "utf8",
  );
  const devices = await readFile(
    "apps/backend/src/domain/devices.ts",
    "utf8",
  );

  assert.match(
    api,
    /@powerchain-protocol\/miner\/api\/v1/,
  );
  assert.match(
    server,
    /@powerchain-protocol\/miner\/cors/,
  );
  assert.match(
    devices,
    /@powerchain-protocol\/miner\/iot\/devices/,
  );
});

test("character and skill docs preserve explicit authority boundaries", async () => {
  const characters = await readFile(
    `${base}/CHARACTERS.md`,
    "utf8",
  );
  const skills = await readFile(
    `${base}/skills/SKILLS.md`,
    "utf8",
  );

  assert.match(characters, /Wallets, human approval and execution policy/);
  assert.match(characters, /does not become a verifier merely/);
  assert.match(skills, /Skills are capabilities, not authorities/);
  assert.match(skills, /direct MPC\/device actuation authority/);
});
