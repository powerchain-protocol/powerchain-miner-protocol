# Local Compute Adapters

Agent Compute's public base URL is:

```text
https://compute.powerchain.energy/v1
```

The gateway supports:

```text
GET  /v1/models
POST /v1/chat/completions
POST /v1/responses
```

Agent Compute exposes both Responses and Chat Completions compatibility so modern OpenAI-style clients and legacy chat clients can share the same funded endpoint.

## Codex local proxy

`codex-local-proxy.mjs` creates a localhost OpenAI-compatible proxy that injects the
PowerChain compute API key.

```bash
export POWERCHAIN_COMPUTE_API_KEY=pc_compute_...
export POWERCHAIN_COMPUTE_BASE_URL=https://compute.powerchain.energy/v1

node apps/compute/adapters/codex-local-proxy.mjs
```

Local endpoint:

```text
http://127.0.0.1:3210/v1
```

Point a Codex/OpenAI-compatible client that supports a custom base URL at this local
endpoint.

## Claude Code local adapter

The Claude adapter accepts a basic Anthropic-style:

```text
POST /v1/messages
```

and converts text-message requests to Agent Compute Chat Completions.

```bash
export POWERCHAIN_COMPUTE_API_KEY=pc_compute_...
export POWERCHAIN_COMPUTE_MODEL=<configured-model>
node apps/compute/adapters/claude-code-local-adapter.mjs
```

Local endpoint:

```text
http://127.0.0.1:3211
```

This v1.0.0 adapter intentionally rejects streaming and advanced Anthropic tool/content block
semantics rather than silently translating them incorrectly.
