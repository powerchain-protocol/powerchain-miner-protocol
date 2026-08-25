# Codex → PowerChain Agent Compute proxy

Codex custom providers use the Responses wire protocol. PowerChain's canonical raw agent
route remains Chat Completions-compatible, so this localhost proxy translates:

```text
Codex /v1/responses
        ↓
PowerChain /v1/chat/completions
        ↓
Responses-shaped result / SSE
```

Start:

```bash
make codex-proxy
```

Then enable the provider:

```bash
make codex-on MODEL=openai-gpt-55
```

The generated Codex provider uses:

```toml
[model_providers.powerchain_apc]
name = "PowerChain Agent Compute"
base_url = "http://127.0.0.1:3210/v1"
env_key = "POWERCHAIN_COMPUTE_API_KEY"
wire_api = "responses"
requires_openai_auth = false
```

The proxy forwards the caller's scoped `pc_compute_*` key to Agent Compute. It never writes
the key to disk.

The translator supports text and function-tool calls. Unsupported Responses content types
are omitted rather than converted into invented text.
