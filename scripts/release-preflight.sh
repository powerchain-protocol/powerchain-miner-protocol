#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EXPECTED_VERSION="${EXPECTED_VERSION:-1.0.0}"

node - "$EXPECTED_VERSION" <<'NODE'
const fs = require("fs");
const expected = process.argv[2];

const packages = [
  "package.json",
  "apps/backend/package.json",
  "apps/console/package.json",
  "apps/compute/package.json",
  "apps/frontend/package.json",
  "apps/mobile/package.json",
  "packages/agent-compute/package.json",
  "packages/api-client/package.json",
  "packages/design-system/package.json",
  "packages/miner-sdk/package.json",
  "packages/powerchain-protocol/miner/package.json",
  "packages/powerchain-protocol/cct/package.json",
  "services/verifier-worker/package.json",
  "services/evidence-verifier/package.json",
];

for (const file of packages) {
  const value = JSON.parse(fs.readFileSync(file, "utf8")).version;
  if (value !== expected) {
    throw new Error(`${file}: expected version ${expected}, got ${value}`);
  }
}
NODE

grep -q '^version = "1.0.0"$' programs/miner/Cargo.toml || {
  echo "programs/miner/Cargo.toml version mismatch" >&2
  exit 1
}

grep -q '^version = "1.0.0"$' programs/cct/Cargo.toml || {
  echo "programs/cct/Cargo.toml version mismatch" >&2
  exit 1
}

grep -q '^version = "1.0.0"$' services/device-agent/pyproject.toml || {
  echo "device-agent version mismatch" >&2
  exit 1
}

node scripts/check-miner-program.mjs >/dev/null
node scripts/check-cct-program.mjs >/dev/null

./scripts/check.sh
./scripts/test.sh

if [[ "${REQUIRE_LOCKFILE:-0}" == "1" && ! -f pnpm-lock.yaml ]]; then
  echo "pnpm-lock.yaml is required for a tagged deterministic release." >&2
  exit 1
fi

if [[ "${REQUIRE_DEPLOYMENT_IDENTITIES:-0}" == "1" ]]; then
  ! grep -q 'declare_id!("11111111111111111111111111111111")' \
    programs/miner/src/lib.rs || {
      echo "Placeholder Miner program ID is still present." >&2
      exit 1
    }

  ! grep -q 'declare_id!("11111111111111111111111111111111")' \
    programs/cct/src/lib.rs || {
      echo "Placeholder CCT program ID is still present." >&2
      exit 1
    }

  node scripts/verify-deployment-manifest.mjs \
    "${POWERCHAIN_DEPLOYMENT_CLUSTER:-devnet}"
fi

echo "release preflight: OK"
