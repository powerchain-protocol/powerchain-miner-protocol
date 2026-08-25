#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "Repository diagnostics"
echo "======================"
echo "node=$(node --version 2>/dev/null || true)"
echo "pnpm=$(pnpm --version 2>/dev/null || true)"
echo "python=$(python3 --version 2>/dev/null || true)"
echo "rust=$(rustc --version 2>/dev/null || true)"
echo "cargo=$(cargo --version 2>/dev/null || true)"
echo "anchor=$(anchor --version 2>/dev/null || true)"
for f in target/manifests/*.json; do
  echo "--- $f"
  cat "$f"
done
