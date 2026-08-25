# PowerChain Renewable Miner OS — Monorepo

## Application topology

```text
apps/
├── backend/    Fastify + PostgreSQL canonical `/api/v1`
├── console/    authenticated Next.js operations console
├── frontend/   public Next.js marketing website + PWA
└── mobile/     Expo / React Native companion application

packages/
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


#### Console internal dependency rule

The console keeps reusable logic under domain/runtime boundaries:

```text
lib/core/         universal helpers
lib/chains/       Solana/Sui logic
lib/wallets/      browser wallet discovery
lib/market-data/  server-only provider integrations
lib/client/       browser-safe exports
lib/server/       BFF/server-only exports
```

New code must use canonical domain imports. Legacy flat files are compatibility facades only.

```bash
corepack pnpm console:architecture
```


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
