import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const tokens = await readFile(
  "packages/design-system/src/tokens.ts",
  "utf8",
);

test("brand design tokens use requested white/gray/green/black system", () => {
  for (const value of [
    "#FFFFFF",
    "#F6F8F6",
    "#0D1510",
    "#0B3D25",
    "#176B3A",
  ]) {
    assert.ok(tokens.includes(value), value);
  }
});

test("brand token source contains no purple/blue/neon accent palette", () => {
  assert.equal(/purple|violet|indigo|magenta|neon/i.test(tokens), false);
});
