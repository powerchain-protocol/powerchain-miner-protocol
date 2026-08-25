#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

python3 -m unittest discover -s tests/python -p 'test_*.py'
node --test tests/node/*.test.mjs

if command -v cargo >/dev/null; then
  cargo test --manifest-path programs/miner/Cargo.toml
fi
