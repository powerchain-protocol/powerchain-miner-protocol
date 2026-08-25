#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${POWERCHAIN_DOCKER_ENV_FILE:-docker/.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  cp docker/.env.example "$ENV_FILE"
  echo "[docker] created $ENV_FILE from docker/.env.example"
  echo "[docker] local defaults are development-only; replace secrets before remote deployment"
fi

exec docker compose --env-file "$ENV_FILE" "$@"
