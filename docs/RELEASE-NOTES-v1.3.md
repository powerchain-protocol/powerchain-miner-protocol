# PowerChain Agent Compute v1.3.0 — Model Discovery & Agent Setup

v1.3 keeps the v1.2 wallet-funded compute accounting model and adds a canonical agent
runtime setup layer.

## Dynamic model discovery

Agents now treat:

```text
GET https://compute.powerchain.energy/v1/models
```

as the runtime source of truth.

Each model entry exposes:

```text
id
name
description
contextLength
```

The bundled production catalog contains the currently documented 16 model IDs, but the live
endpoint returns only routes whose billing and upstream configuration is executable.

This prevents stale client catalogs from selecting disabled or partially configured models.

## Forward-only database migration

`009_v130_model_discovery.sql` adds:

- display name;
- model description;
- context length;
- catalog listing state;
- explicit executable-route completeness checks.

Migration `008_v120_agent_compute.sql` remains unchanged for upgrade safety.

## Codex

New canonical route:

```text
Codex Responses wire protocol
        ↓
utilities/model-routing/codex-powerchain-proxy
        ↓
PowerChain Chat Completions
```

The restore-safe switcher writes the custom provider to:

```text
~/.codex/config.toml
```

with:

```text
wire_api = "responses"
```

The prior global configuration is backed up and restored by `make codex-off`.

## Claude Code

`make claude-setup` now:

- checks Node.js 22+;
- installs/checks Claude Code;
- installs/checks Claude Code Router;
- validates the selected model against live `/models`;
- writes the maintained PowerChain provider;
- starts/restarts the router;
- performs a live routed Claude Code verification request.

## Reusable ACP skills

Canonical sources:

```text
skills/acp-builder-setup/
skills/acp-paid-subscription-checkout/
```

Install:

```bash
make skills-codex
make skills-claude
```

Package uploadable ZIPs:

```bash
make skills-zip
```

## Config safety

Codex and Claude switchers:

- create exact restore points;
- record the installed-file SHA-256;
- do not persist compute secrets;
- refuse to restore over a file that changed while PowerChain routing was active unless
  `FORCE=1` is explicitly supplied.

## API key naming

Canonical:

```text
POWERCHAIN_COMPUTE_API_KEY
```

Compatibility alias:

```text
VIRTUALS_API_KEY
```

When both exist, the PowerChain-specific variable wins.
