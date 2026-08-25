# ACP Builder Setup

Use this skill before configuring a local coding-agent runtime to use PowerChain Agent
Compute.

## Goal

Create a verified local route from the selected agent runtime to:

```text
https://compute.powerchain.energy/v1
```

without hardcoding a stale model catalog or storing the compute secret in repository files.

## Required environment

Preferred:

```bash
export POWERCHAIN_COMPUTE_API_KEY=pc_compute_...
```

Compatibility alias:

```bash
export VIRTUALS_API_KEY=...
```

Optional:

```bash
export POWERCHAIN_COMPUTE_BASE_URL=https://compute.powerchain.energy/v1
```

## Model selection

Always discover or validate the model immediately before setup:

```bash
make models
make model-check MODEL=openai-gpt-55
```

The live `/models` response is authoritative. Do not assume a model still exists because it
appears in documentation or an old config.

## Codex

Codex custom providers use the Responses wire API.

PowerChain's maintained Codex route is:

```text
Codex /v1/responses
        ↓
localhost PowerChain translator
        ↓
PowerChain /v1/chat/completions
```

Setup:

```bash
make codex-setup MODEL=openai-gpt-55
make codex-proxy
codex
```

The switcher:

- saves the previous `~/.codex/config.toml`;
- selects `model_provider = "powerchain_apc"`;
- configures `wire_api = "responses"`;
- uses `POWERCHAIN_COMPUTE_API_KEY` or the compatibility alias as `env_key`;
- never writes the secret value into config;
- refuses destructive restoration if the managed config changed after setup.

Disable:

```bash
make codex-off
```

## Claude Code

Use the maintained router setup:

```bash
make claude-setup MODEL=claude-sonnet-4-6
```

The setup:

1. requires Node.js 22+ for current Claude Code Router;
2. installs Claude Code if missing;
3. installs `@musistudio/claude-code-router` if missing;
4. validates the selected model against live `/models`;
5. saves the previous router config;
6. writes the maintained PowerChain provider;
7. starts/restarts CCR;
8. performs a real Claude Code request through the PowerChain route unless
   `POWERCHAIN_SKIP_LIVE_VERIFY=1`.

Launch:

```bash
ccr code
```

Disable:

```bash
make claude-off
```

## Desktop/web runtimes

Claude Desktop and browser upload flows should use packaged skill ZIPs rather than terminal
router assumptions:

```bash
make skills-zip
```

The checkout skill is intentionally terminal-only because its execution prerequisites are
local.

## Validation

After setup:

```bash
make model-check MODEL="$MODEL"
make codex-status
make claude-status
```

For a compute account check:

```bash
curl -sS \
  -H "Authorization: Bearer $POWERCHAIN_COMPUTE_API_KEY" \
  https://compute.powerchain.energy/v1/account
```

## Security boundaries

Never:

- persist a plaintext compute key in Git;
- copy wallet private keys into Codex/Claude config;
- treat a compute API key as wallet authorization;
- disable runtime permission prompts merely to make setup pass;
- restore over a user-modified global config without explicit review.
