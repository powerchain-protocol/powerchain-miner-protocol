import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

test("dependency security baseline removes current Dependabot vulnerable roots", async () => {
  const [pyproject, requirements, rootPackage, workspace] = await Promise.all([
    read("services/device-agent/pyproject.toml"),
    read("services/device-agent/requirements.txt"),
    read("package.json").then(JSON.parse),
    read("pnpm-workspace.yaml"),
  ]);

  assert.match(pyproject, /cryptography==50\.0\.0/);
  assert.match(requirements, /cryptography==50\.0\.0/);
  assert.equal(rootPackage.pnpm.overrides["uuid@<11.1.1"], "11.1.1");
  assert.equal(rootPackage.pnpm.overrides["uuid@12.0.0"], "12.0.1");
  assert.equal(rootPackage.pnpm.overrides["uuid@13.0.0"], "13.0.1");
  assert.doesNotMatch(workspace, /^\s*bigint-buffer:/m);
});

test("legacy @solana/spl-token npm client is absent from direct workspace dependencies", async () => {
  const paths = [
    "apps/backend/package.json",
    "apps/console/package.json",
    "packages/agent-compute/package.json",
    "packages/miner-sdk/package.json",
    "packages/powerchain-protocol/miner/package.json",
  ];

  for (const path of paths) {
    const pkg = JSON.parse(await read(path));
    assert.equal(pkg.dependencies?.["@solana/spl-token"], undefined, path);
    assert.equal(pkg.devDependencies?.["@solana/spl-token"], undefined, path);
  }
});

test("canonical token client implements ATA, Token-2022 base layouts and TransferChecked without bigint-buffer", async () => {
  const source = await read("packages/powerchain-protocol/miner/src/solana/token-client.ts");
  assert.match(source, /deriveAssociatedTokenAddressSync/);
  assert.match(source, /decodeMintBaseState/);
  assert.match(source, /decodeTokenAccountBaseState/);
  assert.match(source, /createTransferCheckedInstruction/);
  assert.match(source, /data\.writeUInt8\(12, 0\)/);
  assert.doesNotMatch(source, /bigint-buffer/);
});
