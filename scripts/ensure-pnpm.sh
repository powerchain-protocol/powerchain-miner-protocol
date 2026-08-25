#!/usr/bin/env bash
set -euo pipefail

EXPECTED="11.22.0"

command -v corepack >/dev/null 2>&1 || {
  echo "Corepack is required." >&2
  exit 1
}

corepack enable

CURRENT="$(pnpm --version 2>/dev/null || true)"
if [[ "$CURRENT" != "$EXPECTED" ]]; then
  echo "[pnpm] activating pnpm@$EXPECTED"
  corepack use "pnpm@$EXPECTED"
fi

ACTUAL="$(pnpm --version)"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "Expected pnpm $EXPECTED, got $ACTUAL." >&2
  exit 1
fi

echo "[pnpm] $ACTUAL"
