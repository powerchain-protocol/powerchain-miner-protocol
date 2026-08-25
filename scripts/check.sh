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

echo "[check] skills"
node scripts/check-skills.mjs

if command -v cargo >/dev/null; then
  echo "[check] rust fmt"
  cargo fmt --all -- --check
fi

if command -v pnpm >/dev/null && [[ -d node_modules ]]; then
  echo "[check] TypeScript"
  pnpm typecheck
  pnpm api:typecheck
  pnpm typecheck:verifier
  pnpm typecheck:evidence
  pnpm typecheck:sdk
fi

echo "[check] OK"
