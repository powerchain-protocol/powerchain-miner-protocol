#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PACKAGE_DIR="packages/powerchain-protocol/miner"
NAME="$(node -p "require('./${PACKAGE_DIR}/package.json').name")"
VERSION="$(node -p "require('./${PACKAGE_DIR}/package.json').version")"

if [[ -n "${NPM_TOKEN:-}" || -n "${NODE_AUTH_TOKEN:-}" ]]; then
  cat >&2 <<'EOF'
Refusing token-based npm publishing from environment variables.

Use one of these paths instead:
  1. GitHub Actions trusted publishing (recommended), or
  2. `npm login` locally with 2FA for the first package publish.

Do not paste npm tokens into shell history, repository files, CI YAML, or chat.
EOF
  exit 1
fi

node scripts/check-secrets.mjs
corepack pnpm --filter @powerchain-protocol/miner typecheck
corepack pnpm --filter @powerchain-protocol/miner build

if npm view "${NAME}@${VERSION}" version >/dev/null 2>&1; then
  echo "${NAME}@${VERSION} already exists on npm. npm versions are immutable; refusing republish." >&2
  exit 1
fi

npm whoami >/dev/null || {
  echo "npm authentication is required. Run 'npm login' and complete 2FA." >&2
  exit 1
}

cd "$PACKAGE_DIR"
npm pack --dry-run
npm publish --access public
