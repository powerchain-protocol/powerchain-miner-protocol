#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EXPECTED="11.23.0"

command -v corepack >/dev/null 2>&1 || {
  echo "Corepack is required. Install Node.js 24.19+ with Corepack support." >&2
  exit 1
}

PACKAGE_MANAGER="$(node -p "require('./package.json').packageManager")"
if [[ "$PACKAGE_MANAGER" != "pnpm@$EXPECTED" ]]; then
  echo "package.json must pin pnpm@$EXPECTED; found $PACKAGE_MANAGER" >&2
  exit 1
fi

# Activate the exact project pin even if the user's global pnpm shim currently
# resolves to an older pnpm 11 release.
corepack enable
corepack prepare "pnpm@$EXPECTED" --activate >/dev/null
hash -r 2>/dev/null || true

ACTUAL="$(corepack pnpm --version)"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "Expected pnpm $EXPECTED through Corepack, got $ACTUAL." >&2
  exit 1
fi

# Also check the shell shim when available so a stale global installation is
# obvious instead of silently contaminating subsequent commands.
SHIM="$(pnpm --version 2>/dev/null || true)"
if [[ -n "$SHIM" && "$SHIM" != "$EXPECTED" ]]; then
  echo "[pnpm] warning: shell pnpm resolves to $SHIM; using Corepack pnpm $EXPECTED for bootstrap." >&2
fi

echo "[pnpm] $ACTUAL"
