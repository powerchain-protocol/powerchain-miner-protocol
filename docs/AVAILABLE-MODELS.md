# Agent Compute — Available Models

Do not hardcode this table into an agent runtime.

The authoritative discovery call is:

```http
GET https://compute.powerchain.energy/v1/models
```

or, when the base URL is already:

```text
https://compute.powerchain.energy/v1
```

call:

```text
/models
```

Expected response shape:

```json
{
  "data": [
    {
      "id": "openai-gpt-55",
      "name": "GPT-5.5",
      "description": "GPT-5.5 is a frontier model in the GPT-5 series.",
      "contextLength": 1000000
    }
  ]
}
```

The list can change. Setup scripts and agents should call `/models` whenever they need to
discover or validate a model ID.

## Current production catalog

| Model ID | Name | Context |
|---|---|---:|
| `venice-uncensored-1-2` | Venice Uncensored 1.2 | 128k |
| `claude-opus-4-7` | Claude Opus 4.7 | 1M |
| `claude-opus-4-7-fast` | Claude Opus 4.7 Fast | 1M |
| `claude-opus-4-8` | Claude Opus 4.8 | 1M |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | 1M |
| `deepseek-v4-flash` | DeepSeek V4 Flash | 1M |
| `deepseek-v4-pro` | DeepSeek V4 Pro | 1M |
| `minimax-m27` | MiniMax M2.7 | 198k |
| `minimax-m3` | MiniMax M3 | 500k |
| `openai-gpt-54-mini` | GPT-5.4 Mini | 400k |
| `openai-gpt-55` | GPT-5.5 | 1M |
| `openai-gpt-55-pro` | GPT-5.5 Pro | 1M |
| `xiaomi-mimo-v2-5` | MiMo-V2.5 | 1M |
| `zai-org-glm-4.6` | GLM 4.6 | 198k |
| `zai-org-glm-5-1` | GLM 5.1 | 200k |
| `zai-org-glm-5-2` | GLM 5.2 | 1M |

The bundled catalog is stored at:

```text
config/compute-models.production.json
```

It provides metadata for deployment bootstrap. The live endpoint only lists models whose
routing and billing configuration is executable, so the live response remains authoritative.
