import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("root scripts cannot fall back to a stale global pnpm", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(pkg.packageManager, "pnpm@11.23.0");
  assert.equal(pkg.engines.pnpm, "11.23.0");
  for (const [name, command] of Object.entries(pkg.scripts)) {
    if (/\bpnpm\b/.test(command)) {
      assert.match(
        command,
        /corepack pnpm|check-pnpm|ensure-pnpm|pnpm-lock|pnpm@/,
        `${name}: ${command}`,
      );
    }
  }
});

test("bootstrap has one protocol build and optional DB branch", async () => {
  const source = await readFile("scripts/bootstrap-dev.sh", "utf8");
  assert.equal(
    (source.match(/@powerchain-protocol\/miner build/g) ?? []).length,
    1,
  );
  assert.match(source, /--optional/);
  assert.match(source, /DATABASE_NOT_STARTED/);
  assert.match(source, /corepack pnpm/);
});

test("supply chain minimum release age is committed", async () => {
  const source = await readFile("pnpm-workspace.yaml", "utf8");
  assert.match(source, /minimumReleaseAge:\s*1440/);
  assert.match(source, /minimumReleaseAgeStrict:\s*true/);
  assert.match(source, /expo@57\.0\.16/);
  assert.match(source, /react-native@0\.86\.3/);
});
