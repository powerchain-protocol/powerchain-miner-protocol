# PowerChain Renewable Miner OS — Monorepo

## Application topology

```text
apps/
├── backend/    Fastify + PostgreSQL canonical `/api/v1`
├── console/    authenticated Next.js operations console
├── compute/    OpenAI-compatible Agent Compute data plane
├── frontend/   public Next.js marketing website + PWA
└── mobile/     Expo / React Native companion application

packages/
├── agent-compute/  compute metering + wallet-funding helpers
├── api-client/     runtime-neutral typed HTTP client
├── design-system/  shared visual tokens for web/native
└── miner-sdk/      Solana/Anchor administration + PDA helpers

services/
├── device-agent/
├── evidence-verifier/
└── verifier-worker/
```

## Responsibilities

### `apps/backend`

Authoritative application control plane.

Owns:

- authentication;
- tenant/client RBAC;
- device enrollment;
- Proof-of-Energy ingestion;
- evidence workflow;
- rewards;
- claims;
- audit;
- reconciliation;
- `/api/v1`.

It never imports browser/mobile code.

### `apps/console`

Authenticated operator experience.

The console is for:

- SuperAdmin;
- Client Admin;
- Operator;
- Finance;
- Verifier;
- Viewer.

It talks to `apps/backend` through its BFF/server boundary.

### `apps/frontend`

Public website.

Owns:

- product positioning;
- features;
- architecture;
- security explanations;
- PWA installation;
- public documentation/console CTAs.

It must not become an authenticated control-plane duplicate.

### `apps/mobile`

Expo companion.

Owns operational read/review workflows and user-authorized interactions added explicitly in
future versions.

It is not a secret/key custody service.

## Shared packages

### `@powerchain/design-system`

Pure tokens + CSS/native theme. No business logic.

### `@powerchain/api-client`

Runtime-neutral HTTP client for `/api/v1`. May run in browser, Node or React Native.

### `@powerchain/miner-sdk`

Blockchain-specific program operations.

Do not place Solana program administration into `api-client`.

## Dependency direction

```text
design-system ───────→ frontend
        │             console
        └────────────→ mobile

api-client ──────────→ mobile
                      future public clients

miner-sdk ───────────→ deployment/admin tools

backend ─────────────→ PostgreSQL + Solana RPC
console ─────────────→ backend
frontend ────────────→ public URLs
mobile ──────────────→ backend
```

Apps do not import other apps.


### `apps/compute`

Public Agent Compute data plane.

Owns:

- `/v1/models`;
- `/v1/account`;
- `/v1/chat/completions`;
- `/v1/responses`;
- `/v1/topups/:intentId/confirm`;
- upstream provider credentials;
- request preauthorization/reconciliation calls to `apps/backend`.

It does not directly mutate PostgreSQL.

### `@powerchain/agent-compute`

Shared compute primitives:

- API key generation/hash;
- conservative reservation math;
- usage cost arithmetic;
- request schemas;
- Solana top-up transaction construction;
- top-up reconciliation client.
