#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# An externally managed DB is valid. Do not require Docker when it is already reachable.
if POWERCHAIN_DB_WAIT_ATTEMPTS=1 node scripts/check-database.mjs >/dev/null 2>&1; then
  echo "[db] existing PostgreSQL endpoint is reachable; Docker start skipped."
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  cat >&2 <<'EOF'
Docker was not found and PostgreSQL is not reachable.

macOS:
  1. Install Docker Desktop.
  2. Start Docker Desktop.
  3. Re-run: pnpm db:up

Alternative:
  Configure an existing PostgreSQL 17 database in apps/backend/.env:
    DATABASE_URL=postgres://user:password@host:5432/database
EOF
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but the daemon is not running. Start Docker Desktop." >&2
  exit 1
fi

docker compose up -d postgres

echo "[db] waiting for PostgreSQL..."
node scripts/check-database.mjs
