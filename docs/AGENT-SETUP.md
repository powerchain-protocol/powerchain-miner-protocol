# PowerChain Agent Setup

This repository is the canonical source for reusable ACP agent skills and local model-routing
utilities.

## Setup matrix

| Runtime | Skill location | Routing | Global config | Launch |
|---|---|---|---|---|
| Codex | `~/.agents/skills/` | PowerChain Responses translator | `~/.codex/config.toml` | `codex` |
| Claude Code | `~/.claude/skills/` | Claude Code Router | `~/.claude-code-router/config.json` | `ccr code` |
| Claude Desktop/web | uploadable ZIP | no terminal router | application-managed | upload ZIP |

## Shared skills

Canonical source:

```text
skills/
├── acp-builder-setup/
└── acp-paid-subscription-checkout/
```

Install/link:

```bash
make skills-codex
make skills-claude
```

Package for desktop/web upload:

```bash
make skills-zip
```

## Credentials

Preferred:

```bash
export POWERCHAIN_COMPUTE_API_KEY=pc_compute_...
```

Legacy compatibility:

```bash
export VIRTUALS_API_KEY=...
```

The setup scripts use the preferred key when both exist.

## Models

Never select from an embedded client list without validation.

```bash
make models
make model-check MODEL=openai-gpt-55
```

The live endpoint is:

```text
https://compute.powerchain.energy/v1/models
```

## Codex

### Why a proxy exists

Codex custom providers use the Responses wire API. PowerChain's maintained local bridge
translates Codex `/v1/responses` requests to the raw Agent Compute Chat Completions endpoint.

```text
Codex
  ↓ Responses
localhost:3210
  ↓ Chat Completions
compute.powerchain.energy
```

Configure:

```bash
make codex-setup MODEL=openai-gpt-55
```

Start proxy:

```bash
make codex-proxy
```

Run:

```bash
codex
```

Disable and restore the previous global configuration:

```bash
make codex-off
```

Force restoration only after reviewing changes made while PowerChain routing was active:

```bash
make codex-off FORCE=1
```

## Claude Code

Current setup requires Node.js 22+ because the current Claude Code Router release requires it.

```bash
make claude-setup MODEL=claude-sonnet-4-6
```

The setup script:

- installs/checks Claude Code;
- installs/checks Claude Code Router;
- validates the selected model against live `/models`;
- writes the maintained router configuration;
- starts/restarts the router;
- performs a real PowerChain-routed Claude Code request.

Skip only the live verification step when preparing an offline image:

```bash
POWERCHAIN_SKIP_LIVE_VERIFY=1 \
make claude-setup MODEL=claude-sonnet-4-6
```

Launch:

```bash
ccr code
```

Restore:

```bash
make claude-off
```

## Three moving parts

| Part | Responsibility | Tool |
|---|---|---|
| Config switcher | Global config + restore point | `scripts/configure-*-powerchain-apc.mjs` |
| Proxy | Codex Responses → PowerChain Chat Completions | `make codex-proxy` |
| Agent runtime | Sends actual model traffic | `codex` / `ccr code` |

Do not merge these concerns into one opaque wrapper. Keeping them separate makes routing,
credentials, runtime permissions and restoration auditable.
