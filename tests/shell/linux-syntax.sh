#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
bash -n "$ROOT/linux/install.sh"
bash -n "$ROOT/linux/uninstall.sh"
bash -n "$ROOT/linux/healthcheck.sh"
bash -n "$ROOT/command/minerctl"
