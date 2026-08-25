#!/usr/bin/env bash
set -euo pipefail

command -v corepack >/dev/null || { echo "corepack is required" >&2; exit 1; }
corepack enable
corepack use pnpm@11.22.0
pnpm install

if command -v docker >/dev/null; then
  docker compose up -d postgres
fi

pnpm db:migrate
echo "Development bootstrap complete."
