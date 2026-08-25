import test from "node:test";
import assert from "node:assert/strict";

function formatBaseUnits(raw, decimals = 9) {
  const value = BigInt(raw);
  const factor = 10n ** BigInt(decimals);
  const whole = value / factor;
  const fraction = (value % factor).toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""}`;
}

test("large MINER balances remain integer-safe", () => {
  assert.equal(formatBaseUnits(18_446_000_000_000_000_000n), "18446000000");
});
