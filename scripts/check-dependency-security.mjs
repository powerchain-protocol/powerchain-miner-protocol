import {
  readFile,
  access,
} from "node:fs/promises";

const failures = [];
const rootPackage = JSON.parse(
  await readFile("package.json", "utf8"),
);
const pyproject = await readFile(
  "services/device-agent/pyproject.toml",
  "utf8",
);
const requirements = await readFile(
  "services/device-agent/requirements.txt",
  "utf8",
);

for (const [name, source] of [
  ["pyproject.toml", pyproject],
  ["requirements.txt", requirements],
]) {
  if (!source.includes("cryptography==50.0.0")) {
    failures.push(`${name}: cryptography must be pinned to 50.0.0`);
  }
  if (/cryptography(?:>=|==)(?:4[0-9]|[0-3][0-9])(?:\.|[,<])/i.test(source)) {
    failures.push(`${name}: vulnerable cryptography baseline remains`);
  }
}

const override = rootPackage.pnpm?.overrides ?? {};
for (const [selector, expected] of [
  ["uuid@<11.1.1", "11.1.1"],
  ["uuid@12.0.0", "12.0.1"],
  ["uuid@13.0.0", "13.0.1"],
]) {
  if (override[selector] !== expected) {
    failures.push(`package.json: pnpm override ${selector} must resolve to ${expected}`);
  }
}

const packageJsonPaths = [
  "apps/backend/package.json",
  "apps/console/package.json",
  "packages/agent-compute/package.json",
  "packages/miner-sdk/package.json",
  "packages/powerchain-protocol/miner/package.json",
];

for (const path of packageJsonPaths) {
  const pkg = JSON.parse(await readFile(path, "utf8"));
  if (pkg.dependencies?.["@solana/spl-token"] || pkg.devDependencies?.["@solana/spl-token"]) {
    failures.push(`${path}: legacy @solana/spl-token dependency reintroduces bigint-buffer CVE-2025-3194`);
  }
}

try {
  await access("pnpm-lock.yaml");
  const lock = await readFile("pnpm-lock.yaml", "utf8");
  if (/\bbigint-buffer@/m.test(lock) || /\bbigint-buffer:\s*1\.1\.5\b/m.test(lock)) {
    failures.push("pnpm-lock.yaml: bigint-buffer remains in the resolved graph");
  }

  const vulnerableUuidPackage = /\buuid@(7\.0\.3|8\.3\.2|(?:[0-9]|10)(?:\.[0-9]+){1,2}|11\.(?:0(?:\.[0-9]+)?|1\.0)|12\.0\.0|13\.0\.0):/m;
  const vulnerableUuidDependency = /\buuid:\s*(7\.0\.3|8\.3\.2|(?:[0-9]|10)(?:\.[0-9]+){1,2}|11\.(?:0(?:\.[0-9]+)?|1\.0)|12\.0\.0|13\.0\.0)\b/m;
  if (vulnerableUuidPackage.test(lock) || vulnerableUuidDependency.test(lock)) {
    failures.push("pnpm-lock.yaml: vulnerable uuid release remains; regenerate with pnpm 11.23.0 overrides");
  }
} catch {
  console.warn("[security] pnpm-lock.yaml is absent; manifest policy passed, but regenerate and commit the lockfile before merging the Dependabot fix.");
}

if (failures.length) {
  throw new Error(`Dependency security policy failed:\n- ${failures.join("\n- ")}`);
}

console.log("Dependency security: cryptography 50.0.0, patched uuid policy, and bigint-buffer removal verified");
