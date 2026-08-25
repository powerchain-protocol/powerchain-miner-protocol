#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="strict"
case "${1:-}" in
  --optional) MODE="optional" ;;
  --strict|"") MODE="strict" ;;
  *) echo "Usage: $0 [--strict|--optional]" >&2; exit 2 ;;
esac

ready() {
  POWERCHAIN_DB_WAIT_ATTEMPTS=1 node scripts/check-database.mjs >/dev/null 2>&1
}

if ready; then
  echo "[db] existing PostgreSQL endpoint is reachable; Docker start skipped."
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  if [[ "$MODE" == "optional" ]]; then
    cat <<'EOF'
[db] PostgreSQL is not reachable and Docker is not installed.
[db] Database setup skipped; the JavaScript workspace is still ready.
[db]
[db] To enable the database later:
[db]   - install/start Docker Desktop, then run: pnpm db:up
[db]   - OR configure DATABASE_URL in apps/backend/.env
EOF
    exit 3
  fi

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
  if [[ "$MODE" == "optional" ]]; then
    echo "[db] Docker is installed but its daemon is not running; database setup skipped." >&2
    echo "[db] Start Docker Desktop, then run: pnpm db:up" >&2
    exit 3
  fi
  echo "Docker is installed but the daemon is not running. Start Docker Desktop." >&2
  exit 1
fi

./scripts/docker-compose.sh up -d postgres

echo "[db] waiting for PostgreSQL..."
node scripts/check-database.mjs
