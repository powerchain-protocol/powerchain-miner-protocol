# PowerChain Renewable Miner OS + Agent Compute v1.0.0

**Status:** Canonical  
**Public version:** `1.0.0`

This document supersedes the working `1.1.x`, `1.2.x`, and `1.3.x` iteration labels used
during implementation. Their completed functionality is folded into this canonical release.

## Canonical monorepo

```text
apps/
├── backend/    Fastify + PostgreSQL control plane
├── console/    authenticated Next.js operator console
├── compute/    Agent Compute data plane
├── frontend/   marketing website + PWA
└── mobile/     Expo / React Native companion

packages/
├── agent-compute/
├── api-client/
├── design-system/
└── miner-sdk/
```

## Renewable Miner

Included:

- signed Proof of Energy;
- PostgreSQL-backed verification lifecycle;
- reward accounting;
- Solana/Token-2022 settlement;
- verifier worker;
- source rotation;
- on-chain device/miner binding;
- reward claim lifecycle;
- append-only audit/evidence;
- Linux/Raspberry Pi node tooling;
- signed software release/update verification.

## Agent Compute

Included:

- wallet-funded compute accounts;
- scoped one-time `pc_compute_*` API keys;
- `/v1/models`;
- `/v1/account`;
- `/v1/chat/completions`;
- `/v1/responses`;
- append-only compute-credit ledger;
- conservative request reservations;
- usage settlement;
- bounded auto-top-up;
- Solana funding verification;
- Codex Responses adapter;
- Claude Code Router setup;
- reusable ACP skills.

## Model discovery

Runtime source of truth:

```text
GET https://compute.powerchain.energy/v1/models
```

Clients should discover and validate model IDs dynamically rather than hardcoding the bundled
catalog.

## Canonical development bootstrap

```bash
corepack enable
pnpm bootstrap
```

The bootstrap:

- pins pnpm 11.22.0;
- creates missing local env files;
- validates the committed dependency build-script policy;
- installs dependencies once;
- starts or reuses PostgreSQL;
- waits for DB readiness;
- runs migrations and seed data.

## pnpm build policy

```yaml
strictDepBuilds: true

allowBuilds:
  esbuild: true
  bigint-buffer: false
  bufferutil: false
  utf-8-validate: false

verifyDepsBeforeRun: warn
```

`esbuild` is permitted. Optional native acceleration scripts remain denied.

## Version policy

All public app/package/service metadata is `1.0.0`.

Database migration sequence numbers are internal schema-evolution identifiers and are not
public product version numbers. They remain stable so already-initialized databases do not
re-run or misidentify applied migrations.
