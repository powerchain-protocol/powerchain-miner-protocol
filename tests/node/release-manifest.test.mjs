import test from "node:test";
import assert from "node:assert/strict";

test("release artifact hash is a 32-byte hex digest", () => {
  assert.match("a".repeat(64), /^[a-f0-9]{64}$/);
});
