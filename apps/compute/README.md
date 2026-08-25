# @powerchain/compute

Public Agent Compute data plane.

Base URL:

```text
https://compute.powerchain.energy/v1
```

Local development:

```bash
cp apps/compute/.env.example apps/compute/.env
pnpm dev:compute
```

Default local port:

```text
3200
```

Endpoints:

- `GET /v1/models`
- `GET /v1/account`
- `POST /v1/chat/completions`
- `POST /v1/responses`
- `POST /v1/topups/:intentId/confirm`

The service never receives agent wallet private keys. It hashes the Agent Compute API key
locally and uses the backend's trusted internal compute contract for authorization and usage
settlement.


## Model discovery

The `/v1/models` response is dynamic and returns only currently executable model routes.

Each record includes:

```text
id
name
description
contextLength
```

Validate a model ID immediately before agent setup instead of hardcoding the bundled catalog.
