#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

./scripts/ensure-pnpm.sh

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

if [[ -f pnpm-lock.yaml ]]; then
  echo "[deps] installing from committed lockfile"
  pnpm install --frozen-lockfile
else
  echo "[deps] pnpm-lock.yaml is missing; generating it once"
  pnpm install --no-frozen-lockfile
  echo
  echo "[deps] IMPORTANT: commit pnpm-lock.yaml after this successful install."
fi

./scripts/db-up.sh
pnpm db:migrate
pnpm db:seed

echo
echo "Development bootstrap complete."
echo
echo "Run in separate terminals:"
echo "  pnpm dev:backend"
echo "  pnpm dev:console"
echo "  pnpm dev:compute"
echo "  pnpm dev:frontend"
echo "  pnpm dev:mobile"
