import test from "node:test";
import assert from "node:assert/strict";
import {
  readFile,
  readdir,
} from "node:fs/promises";
import { join } from "node:path";

const expected = "1.0.0";

async function packageFiles(root) {
  const files = [];

  async function walk(directory) {
    const entries = await readdir(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const child = join(directory, entry.name);
      files.push(join(child, "package.json"));
      await walk(child);
    }
  }

  await walk(root);
  return files;
}

test("all public workspace package versions are canonical 1.0.0", async () => {
  const files = [
    "package.json",
    ...(await packageFiles("apps")),
    ...(await packageFiles("packages")),
    ...(await packageFiles("services")),
  ];

  for (const file of files) {
    try {
      const pkg = JSON.parse(
        await readFile(file, "utf8"),
      );
      assert.equal(
        pkg.version,
        expected,
        `${file} must be ${expected}`,
      );
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
  }
});

test("public API contracts use canonical 1.0.0", async () => {
  for (const file of [
    "apps/backend/openapi.yaml",
    "apps/compute/openapi.yaml",
  ]) {
    const source = await readFile(file, "utf8");
    assert.match(source, /version:\s*1\.0\.0/);
  }
});

test("README declares canonical v1.0.0", async () => {
  const source = await readFile("README.md", "utf8");
  assert.match(source, /\*\*(?:Canonical version|Version):\*\*\s*`?1\.0\.0`?/);
  assert.match(source, /only supported product version/i);
});
