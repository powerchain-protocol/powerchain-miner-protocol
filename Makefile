SHELL := /usr/bin/env bash

MODEL ?=
FORCE ?= 0
FORCE_FLAG := $(if $(filter 1,$(FORCE)),--force,)

.PHONY: \
  models model-check \
  codex-setup codex-on codex-off codex-status codex-proxy \
  claude-setup claude-on claude-off claude-status \
  skills-codex skills-claude skills-all skills-zip \
  agent-setup

models:
	node utilities/model-routing/list-models.mjs

model-check:
	@test -n "$(MODEL)" || (echo "MODEL is required" >&2; exit 2)
	node utilities/model-routing/list-models.mjs "$(MODEL)"

codex-setup:
	@test -n "$(MODEL)" || (echo "MODEL is required" >&2; exit 2)
	MODEL="$(MODEL)" ./scripts/setup-codex-powerchain-apc.sh
	node scripts/install-agent-skills.mjs codex

codex-on:
	@test -n "$(MODEL)" || (echo "MODEL is required" >&2; exit 2)
	node utilities/model-routing/list-models.mjs "$(MODEL)"
	MODEL="$(MODEL)" node scripts/configure-codex-powerchain-apc.mjs on

codex-off:
	node scripts/configure-codex-powerchain-apc.mjs off $(FORCE_FLAG)

codex-status:
	node scripts/configure-codex-powerchain-apc.mjs status

codex-proxy:
	./scripts/codex-proxy.sh

claude-setup:
	@test -n "$(MODEL)" || (echo "MODEL is required" >&2; exit 2)
	MODEL="$(MODEL)" ./scripts/setup-claude-powerchain-apc.sh
	node scripts/install-agent-skills.mjs claude

claude-on:
	@test -n "$(MODEL)" || (echo "MODEL is required" >&2; exit 2)
	node utilities/model-routing/list-models.mjs "$(MODEL)"
	MODEL="$(MODEL)" node scripts/configure-claude-powerchain-apc.mjs on

claude-off:
	node scripts/configure-claude-powerchain-apc.mjs off $(FORCE_FLAG)

claude-status:
	node scripts/configure-claude-powerchain-apc.mjs status

skills-codex:
	node scripts/install-agent-skills.mjs codex

skills-claude:
	node scripts/install-agent-skills.mjs claude

skills-all:
	node scripts/install-agent-skills.mjs all

skills-zip:
	python3 scripts/package-agent-skills.py

agent-setup:
	@cat docs/AGENT-SETUP.md
