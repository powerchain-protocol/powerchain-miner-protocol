# @powerchain/backend

**Version:** `1.0.0`  
**Runtime:** Fastify 5 · PostgreSQL 17 · Node.js 24

The backend is the authoritative PowerChain control plane for authentication, tenant RBAC, devices, Proof-of-Energy evidence, rewards, claims, audit, chain reconciliation, releases, agents, and Agent Compute accounting.

## API boundaries

```text
Public     /api/v1/*
Internal   /api/v1/internal/*
```

Internal routes are service-to-service contracts and must not be exposed as equivalent public user APIs.

## Responsibilities

- user/session authentication;
- client memberships and roles;
- device enrollment and canonical signing identity;
- proof admission and evidence lifecycle;
- signed verifier registry/quorum;
- reward policy and append-only ledger;
- reward claims/approval/holds;
- Solana chain-binding and settlement verification;
- source rotation;
- audit-chain integrity;
- Agent Compute accounts, reservations, usage and top-up verification;
- OpenAPI/Postman contract.

## Local development

```bash
cp apps/backend/.env.example apps/backend/.env
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev:backend
```

Default URL:

```text
http://localhost:3100/api/v1
```

The app loads `apps/backend/.env` automatically; already-exported process environment variables take precedence.

## Contracts

- [`src/api/v1/README.md`](src/api/v1/README.md)
- [`openapi.yaml`](openapi.yaml)
- [`postman/`](postman/)
- [`../../docs/BACKEND-RBAC-REWARDS.md`](../../docs/BACKEND-RBAC-REWARDS.md)
- [`../../docs/SECURITY.md`](../../docs/SECURITY.md)
