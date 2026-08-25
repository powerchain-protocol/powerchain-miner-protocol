#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

failures=0

ok() {
  printf '  [ok] %s\n' "$1"
}

warn() {
  printf '  [warn] %s\n' "$1"
}

fail() {
  printf '  [fail] %s\n' "$1" >&2
  failures=$((failures + 1))
}

echo "PowerChain development doctor"
echo "============================="

if command -v node >/dev/null 2>&1; then
  NODE_VERSION="$(node -p 'process.versions.node')"
  NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
  NODE_MINOR="$(node -p 'Number(process.versions.node.split(".")[1])')"
  if (( NODE_MAJOR == 24 && NODE_MINOR >= 19 )); then
    ok "Node.js $NODE_VERSION"
  else
    fail "Node.js $NODE_VERSION; repository requires >=24.19.0 <25"
  fi
else
  fail "Node.js is not installed"
fi

if command -v corepack >/dev/null 2>&1; then
  ok "Corepack is available"
else
  fail "Corepack is required"
fi

if command -v pnpm >/dev/null 2>&1; then
  PNPM_VERSION="$(pnpm --version 2>/dev/null || true)"
  if [[ "$PNPM_VERSION" == "11.23.0" ]]; then
    ok "pnpm $PNPM_VERSION"
  else
    warn "pnpm ${PNPM_VERSION:-unknown}; packageManager pins 11.23.0"
  fi
else
  warn "pnpm shim is not active yet; run corepack enable"
fi

if [[ -f pnpm-lock.yaml ]]; then
  ok "pnpm-lock.yaml exists"
else
  warn "pnpm-lock.yaml is missing; first install will generate it and it should be committed"
fi

if [[ -f apps/backend/.env ]]; then
  ok "apps/backend/.env exists"
else
  warn "apps/backend/.env is missing; copy apps/backend/.env.example"
fi

if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    ok "Docker daemon is running"
  else
    warn "Docker CLI exists but the daemon is not running; start Docker Desktop"
  fi
else
  warn "Docker is not installed; use Docker Desktop or an external PostgreSQL 17 instance"
fi

if POWERCHAIN_DB_WAIT_ATTEMPTS=1 node scripts/check-database.mjs >/dev/null 2>&1; then
  ok "PostgreSQL is reachable"
else
  warn "PostgreSQL is not currently reachable"
fi

node scripts/check-pnpm-build-policy.mjs >/dev/null
ok "pnpm dependency build policy is explicit"

if (( failures > 0 )); then
  echo
  echo "Doctor found $failures blocking prerequisite(s)." >&2
  exit 1
fi

echo
echo "Doctor completed."
