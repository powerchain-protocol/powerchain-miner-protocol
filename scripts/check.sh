#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "[check] shell syntax"
find scripts linux command os -type f \( -name '*.sh' -o -name 'minerctl' \) -print0 |
  while IFS= read -r -d '' file; do bash -n "$file"; done

echo "[check] python"
python3 -m compileall -q services/device-agent/powerchain_miner tests/python

echo "[check] node tests"
node --test tests/node/*.test.mjs

echo "[check] OpenAPI"
node scripts/check-openapi.mjs

echo "[check] docs"
node scripts/check-docs.mjs

echo "[check] skills"
node scripts/check-skills.mjs

echo "[check] pnpm build policy"
node scripts/check-pnpm-build-policy.mjs

echo "[check] Miner program contract"
node scripts/check-miner-program.mjs

if command -v cargo >/dev/null; then
  echo "[check] rust fmt"
  cargo fmt --manifest-path programs/miner/Cargo.toml --all -- --check
fi

if command -v corepack >/dev/null 2>&1 && [[ -d node_modules ]]; then
  echo "[check] TypeScript"
  corepack pnpm typecheck
  corepack pnpm api:typecheck
  corepack pnpm typecheck:verifier
  corepack pnpm typecheck:evidence
  corepack pnpm typecheck:sdk
fi

echo "[check] OK"
