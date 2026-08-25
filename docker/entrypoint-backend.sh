#!/usr/bin/env bash
set -euo pipefail

cd /workspace/apps/backend

if [[ "${POWERCHAIN_RUN_MIGRATIONS:-true}" == "true" ]]; then
  echo "[backend] applying database migrations"
  ./node_modules/.bin/tsx scripts/migrate.ts
fi

if [[ "${POWERCHAIN_RUN_SEED:-false}" == "true" ]]; then
  echo "[backend] seeding development data"
  ./node_modules/.bin/tsx scripts/seed.ts
fi

exec ./node_modules/.bin/tsx src/server.ts
