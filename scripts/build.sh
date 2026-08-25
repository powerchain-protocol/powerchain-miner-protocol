#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if command -v anchor >/dev/null; then
  anchor build
else
  echo "anchor not installed; skipping Solana program build" >&2
fi

if command -v pnpm >/dev/null; then
  pnpm build:web
else
  echo "pnpm not installed; skipping Next.js build" >&2
fi
