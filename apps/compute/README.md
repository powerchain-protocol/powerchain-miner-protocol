# @powerchain/compute

**Version:** `1.0.0`  
**Public base URL:** `https://compute.powerchain.energy/v1`

Agent Compute is the PowerChain inference data plane. It authenticates scoped agent compute keys, requests spend authorization from the backend control plane, forwards approved inference to the configured upstream, and reconciles returned token usage.

## Endpoints

```http
GET  /v1/models
GET  /v1/account
POST /v1/chat/completions
POST /v1/responses
POST /v1/topups/:intentId/confirm
```

`/v1/models` is dynamic and should be used to discover/validate model IDs instead of hardcoding a client catalog.

## Security boundary

The service never receives the agent wallet private key. A compute API key authorizes compute-credit usage only. Wallet-funded top-ups remain a separate signing workflow and are independently verified before credit is issued.

## Development

```bash
cp apps/compute/.env.example apps/compute/.env
corepack pnpm dev:compute
```

Default local port: `3200`.

See [`../../docs/AGENT-COMPUTE.md`](../../docs/AGENT-COMPUTE.md) and [`adapters/README.md`](adapters/README.md).
