#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REQUIRE_DB="${POWERCHAIN_REQUIRE_DATABASE:-0}"
SKIP_DB=0

for arg in "$@"; do
  case "$arg" in
    --require-db|--with-db) REQUIRE_DB=1 ;;
    --skip-db) SKIP_DB=1 ;;
    -h|--help)
      cat <<'EOF'
Usage: corepack pnpm bootstrap -- [--require-db|--skip-db]

Default behavior:
  install/build the workspace and initialize PostgreSQL only when a database
  is reachable or Docker is available.

Options:
  --require-db   database startup/migrations are mandatory; fail if unavailable
  --skip-db      never attempt database startup/migrations
EOF
      exit 0
      ;;
    *) echo "Unknown bootstrap argument: $arg" >&2; exit 2 ;;
  esac
done

./scripts/ensure-pnpm.sh
PNPM=(corepack pnpm)

echo "[pnpm] canonical $(${PNPM[@]} --version)"

if [[ ! -f apps/backend/.env ]]; then
  cp apps/backend/.env.example apps/backend/.env
  echo "[env] created apps/backend/.env from example"
fi

if [[ ! -f apps/console/.env.local && -f apps/console/.env.example ]]; then
  cp apps/console/.env.example apps/console/.env.local
  echo "[env] created apps/console/.env.local from example"
fi

if [[ ! -f apps/compute/.env ]]; then
  cp apps/compute/.env.example apps/compute/.env
  echo "[env] created apps/compute/.env from example"
fi

if [[ ! -f apps/mobile/.env && -f apps/mobile/.env.example ]]; then
  cp apps/mobile/.env.example apps/mobile/.env
  echo "[env] created apps/mobile/.env from example"
fi

node scripts/check-pnpm-build-policy.mjs
node scripts/check-secrets.mjs

if [[ -f pnpm-lock.yaml ]]; then
  echo "[deps] installing from committed lockfile"
  "${PNPM[@]}" install --frozen-lockfile
else
  echo "[deps] pnpm-lock.yaml is missing; generating it once"
  "${PNPM[@]}" install --no-frozen-lockfile
  echo
  echo "[deps] IMPORTANT: commit pnpm-lock.yaml after this successful install."
fi

echo "[build] @powerchain-protocol/miner"
"${PNPM[@]}" --filter @powerchain-protocol/miner build

DB_READY=0
if [[ "$SKIP_DB" == "0" ]]; then
  if [[ "$REQUIRE_DB" == "1" ]]; then
    ./scripts/db-up.sh --strict
    DB_READY=1
  else
    set +e
    ./scripts/db-up.sh --optional
    DB_STATUS=$?
    set -e

    case "$DB_STATUS" in
      0) DB_READY=1 ;;
      3) DB_READY=0 ;;
      *) exit "$DB_STATUS" ;;
    esac
  fi
fi

if [[ "$DB_READY" == "1" ]]; then
  "${PNPM[@]}" db:migrate
  "${PNPM[@]}" db:seed
  echo "[db] migrations and seed complete"
else
  echo "[db] migrations/seed skipped"
fi

echo
echo "Development bootstrap complete."
if [[ "$DB_READY" == "0" ]]; then
  echo "Status: WORKSPACE_READY / DATABASE_NOT_STARTED"
  echo "Database later: corepack pnpm db:up"
else
  echo "Status: WORKSPACE_READY / DATABASE_READY"
fi

echo
echo "Run:"
echo "  corepack pnpm dev:apps"
echo "  corepack pnpm dev:mobile"
