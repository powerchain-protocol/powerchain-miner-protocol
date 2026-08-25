# PowerChain Renewable Miner OS

**Canonical version:** `1.0.0`  
**Runtime:** Node.js `24.19.0` · pnpm `11.23.0`  
**Blockchain:** Solana · Anchor `1.1.2` · Token-2022  
**Node targets:** Raspberry Pi · Linux · Docker  
**Core protocol:** Proof of Energy (PoE)

PowerChain Renewable Miner OS is a production-oriented DePIN and agent-infrastructure monorepo for turning **verified renewable-energy activity** into signed evidence, controlled reward accounting, auditable settlement, and wallet-funded agent compute.

It is not a Proof-of-Work miner and does not mine SOL. Physical meters and operational systems remain the source of measurement truth; blockchain is used for authorization, settlement, and verifiable protocol state.

> **Physical systems provide truth. Evidence establishes trust. Policy calculates economics. Humans approve high-consequence actions. Wallets authorize. Solana settles. Ledgers reconcile and audit.**

---

## Status

| Area | Canonical implementation |
|---|---|
| Product version | `1.0.0` |
| Package manager | pnpm `11.23.0` |
| Miner program | Anchor / Rust |
| Reward token interface | Solana Token-2022 |
| Backend | Fastify 5 + PostgreSQL 17 |
| Operator UI | Next.js 16 + React 19 |
| Mobile | Expo SDK 57 + React Native 0.86 |
| Agent Compute | OpenAI-compatible `/v1` data plane |
| Device node | Python/Linux/Raspberry Pi |
| Deployment | Docker Compose + native development |

### Important deployment warning

The Miner program currently contains a **placeholder Solana program ID**:

```text
11111111111111111111111111111111
```

Do not treat this repository as Mainnet-Beta deployable until the program ID, deployment manifests, program authorities, Token-2022 mint, treasury, verifier identity, RPC configuration, and release gates have been synchronized and verified. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) and [`docs/history/migrations/MIGRATION-v1.0.md`](docs/history/migrations/MIGRATION-v1.0.md).

---

## System architecture

```text
                    PHYSICAL ENERGY SYSTEMS
         Solar · Wind · Hydro · Battery · EV · Grid
                              │
                       Meter / EMS / BMS
                              │
                              ▼
                  Raspberry Pi / Linux Node
                 Ed25519 signed Proof of Energy
                              │
                              ▼
                    PowerChain Backend API
                 PostgreSQL · RBAC · Evidence
                              │
                ┌─────────────┼──────────────┐
                │             │              │
                ▼             ▼              ▼
         Verification      Rewards       Audit / Outbox
          quorum            ledger          evidence
                │             │              │
                └─────────────┼──────────────┘
                              ▼
                       Review / Approval
                              │
                              ▼
                      Reward-owner wallet
                              │
                              ▼
                     Solana Miner Program
                              │
                    Token-2022 treasury
                              │
                              ▼
                       ClaimReceipt PDA
                              │
                              ▼
                    Reconciliation / Audit
```

The authoritative reward path is:

```text
OBSERVE
  ↓
SIGN DEVICE EVIDENCE
  ↓
VERIFY
  ↓
CALCULATE REWARD
  ↓
APPROVE CLAIM
  ↓
WALLET AUTHORIZE
  ↓
SOLANA SETTLEMENT
  ↓
RECONCILE
  ↓
AUDIT
```

---

## Repository structure

```text
.
├── apps/
│   ├── backend/             Fastify/PostgreSQL control plane
│   ├── console/             authenticated operator console
│   ├── compute/             Agent Compute data plane
│   ├── frontend/            marketing website + PWA
│   └── mobile/              Expo / React Native companion
├── packages/
│   ├── powerchain-protocol/
│   │   └── miner/           canonical Miner protocol contracts
│   ├── miner-sdk/           Anchor/Solana administration SDK
│   ├── agent-compute/       compute client, billing and top-up primitives
│   ├── api-client/          runtime-neutral API client
│   └── design-system/       shared web/native design tokens
├── programs/
│   └── miner/               Anchor Miner program
├── services/
│   ├── device-agent/        Raspberry Pi/Linux node
│   ├── evidence-verifier/   signed evidence verification
│   └── verifier-worker/     settlement/verifier worker
├── skills/                  reusable AgentOS/ACP skills
├── utilities/               local model-routing utilities
├── docker/                  hardened Docker entrypoints/config
├── linux/                   Linux distribution assets
├── os/                      appliance configuration
├── ems/                     EMS profiles
├── integrations/            integration boundaries
├── docs/                    protocol and operator documentation
└── tests/                   Node, Python and integration fixtures
```

For ownership and dependency direction, see [`docs/MONOREPO.md`](docs/MONOREPO.md) and [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md).

---

## Miner program

The canonical on-chain program lives at [`programs/miner`](programs/miner/README.md).

### Persisted accounts

| Account | Purpose |
|---|---|
| `ProtocolConfig` | authority, verifier, mint, treasury, reward limits, emission policy, pause state |
| `MinerAccount` | reward owner, claimable balance, earned/claimed totals and accepted work |
| `DeviceAccount` | enrolled device signing key, Miner binding, sequence and evidence state |
| `ClaimReceipt` | one-time claim settlement receipt keyed by claim UUID bytes |

### PDA namespaces

```text
protocol
treasury-authority
treasury-vault
miner
device
claim-receipt
```

### Instructions

```text
initialize_protocol
register_miner
register_device
reassign_device
submit_verified_proof
claim_rewards
set_device_enabled
set_paused
set_verifier
update_reward_policy
propose_authority
cancel_authority_transfer
accept_authority
```

The full account constraints, reward invariants, authority model, and deployment procedure are documented in [`programs/miner/README.md`](programs/miner/README.md).

---

## Proof of Energy

A Proof of Energy is an evidence batch representing verified physical renewable-energy activity. The on-chain proof uses deterministic integer units and contains:

```text
sequence
observed_at
verified_at
energy_wh
sample_count
quality_bps
proof_digest
previous_digest
source_hash
reward_base_units
```

Key invariants:

- energy is integer watt-hours on-chain;
- quality is basis points in the range `0..10_000` and must meet protocol minimums;
- sequence numbers are monotonic for accepted verified proofs;
- proof and source digests must be non-zero;
- observation and verification age windows are bounded;
- backend reward policy may be stricter than the program;
- on-chain reward cannot exceed the protocol-wide quality-adjusted ceiling;
- the protocol emission cap cannot be exceeded.

See [`docs/PROOF-OF-ENERGY.md`](docs/PROOF-OF-ENERGY.md).

Verified proofs are settled through leased worker ownership and durable Solana intents; workers never consume a shared race-prone queue. See [`docs/SETTLEMENT-LEASES.md`](docs/SETTLEMENT-LEASES.md).

---

## Reward and claim model

Rewards are **not minted by the Raspberry Pi** and the node never holds treasury authority.

```text
verified proof
   ↓
reward calculation
   ↓
append-only reward ledger
   ↓
member REQUESTED claim
   ↓
role-distinct client approval quorum
   ↓
short-lived wallet authorization
   ↓
claim_rewards
   ↓
Token-2022 treasury transfer
   ↓
ClaimReceipt PDA
   ↓
API chain verification
   ↓
CONFIRMED
```

Security properties include:

- no claim self-approval;
- SuperAdmin is not a substitute for a client-scoped Finance/Client Admin approval;
- high-value claims can require distinct Finance + Client Admin approvals;
- approval policy is snapshotted when the claim is requested;
- exact claim destination binding;
- short-lived claim authorization windows;
- one claim UUID → one ClaimReceipt PDA;
- Token-2022 mint and treasury checks on-chain;
- backend confirmation only after transaction semantics are independently verified.

See [`docs/CLAIM-SETTLEMENT-v1.md`](docs/CLAIM-SETTLEMENT-v1.md) and [`docs/CLAIM-APPROVALS.md`](docs/CLAIM-APPROVALS.md).

---


### Mining engine and epochs

Canonical `@powerchain-protocol/miner` now composes:

```text
system → proof rules → epoch → reward engine → settlement
```

Epoch identity is deterministic from physical observation time; delayed settlement does not
change the proof's protocol epoch.

See [Mining Engine](docs/MINING-ENGINE.md), [MINER skill](skills/MINER.md), and
[Rewards skill](skills/REWARDS.md).

### Payments

Solana Pay transfer-request helpers live in `@powerchain-protocol/miner/pay`. Agent-paid HTTP
flows use the separately pinned pay.sh CLI in sandbox-first mode.

```bash
pnpm pay:version
pnpm pay:sandbox -- https://debugger.pay.sh/mpp/quote/AAPL
```

See [PAY.SH skill](skills/PAY.SH.md) and [Key Management](docs/KEY-MANAGEMENT.md).

## Agent Compute

Agent Compute lets an AgentOS identity fund and consume hosted compute using the same agent wallet while keeping wallet signing separate from inference credentials.

**Public base URL:**

```text
https://compute.powerchain.energy/v1
```

Core endpoints:

```http
GET  /v1/models
GET  /v1/account
POST /v1/chat/completions
POST /v1/responses
POST /v1/topups/:intentId/confirm
```

Capabilities:

- dynamically discoverable model catalog;
- scoped one-time `pc_compute_*` API keys;
- conservative request preauthorization;
- append-only compute-credit ledger;
- actual token-usage settlement;
- bounded auto-top-up policy;
- independently verified Solana funding transactions;
- Codex Responses adapter;
- Claude Code Router setup;
- reusable ACP skills.

A compute API key can spend **compute credit**. It cannot sign a wallet transaction or become treasury/program authority.

See [`docs/AGENT-COMPUTE.md`](docs/AGENT-COMPUTE.md) and [`docs/AGENT-SETUP.md`](docs/AGENT-SETUP.md).

---

## API

The backend public contract is namespaced under:

```text
/api/v1/*
```

Core domains include:

```text
auth
clients
memberships
devices
proofs
evidence
rewards
reward-claims
source-rotations
audit
agents
compute
releases
internal workers
settlement leases / intents
```

Operational chain verification:

```http
GET /api/v1/health/chain
```

This validates the deployed Miner program, v1 ProtocolConfig, Token-2022 treasury PDA/mint/authority, and RPC freshness.

API references:

- [`apps/backend/openapi.yaml`](apps/backend/openapi.yaml)
- [`apps/backend/postman/`](apps/backend/postman/)
- [`apps/compute/openapi.yaml`](apps/compute/openapi.yaml)
- [`apps/compute/postman/`](apps/compute/postman/)

---

## Applications

| Application | Purpose | Default local port |
|---|---|---:|
| `apps/console` | authenticated operations | `3000` |
| `apps/backend` | API/control plane | `3100` |
| `apps/compute` | Agent Compute | `3200` |
| `apps/frontend` | public website/PWA | `3002` |
| `apps/mobile` | Expo development server | Expo/Metro |

The product design is light-first: white surfaces, light-gray canvas, dark green actions, black/charcoal typography. See [`docs/DESIGN-GUIDE.md`](docs/DESIGN-GUIDE.md).

---

## Requirements

```text
Node.js       >=24.19.0 <25
pnpm          11.23.0
PostgreSQL    17
Rust/Anchor   required for on-chain program build/test
Docker        optional for native development; recommended for local stack
```

The workspace commits an explicit pnpm dependency-build policy. New dependency install scripts remain denied until reviewed.

---

## Quick start

### Native development

```bash
corepack enable
pnpm bootstrap
```

`pnpm bootstrap`:

1. activates the exact project pin, pnpm `11.23.0`, through Corepack;
2. creates missing local environment files;
3. validates dependency build policy;
4. performs one dependency install;
5. reuses PostgreSQL when it is already reachable;
6. starts PostgreSQL with Docker when Docker is available;
7. applies migrations and seed data only when PostgreSQL is ready.

Docker/PostgreSQL is **optional for the default bootstrap**. If neither is available, the command exits successfully as:

```text
WORKSPACE_READY / DATABASE_NOT_STARTED
```

Use the strict database bootstrap when backend database readiness is mandatory:

```bash
pnpm bootstrap:db
```

Or explicitly prepare only the JavaScript/tooling workspace:

```bash
pnpm bootstrap:no-db
```

Start the main application stack:

```bash
pnpm dev:apps
```

Start Expo separately:

```bash
pnpm dev:mobile
```

### Docker

```bash
cp docker/.env.example docker/.env
pnpm docker:build
pnpm docker:up
```

Optional Agent Compute service:

```bash
pnpm docker:compute
```

Optional mobile/Metro profile:

```bash
pnpm docker:mobile
```

See [`docker/README.md`](docker/README.md).

---

## Common commands

```bash
# Environment / dependencies
pnpm doctor
pnpm bootstrap
pnpm deps:build-policy
pnpm peers:check

# Development
pnpm dev:apps
pnpm dev:backend
pnpm dev:console
pnpm dev:compute
pnpm dev:frontend
pnpm dev:mobile
pnpm dev:evidence
pnpm dev:verifier

# Database
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm db:smoke

# Solana / Anchor program
pnpm program:doctor
pnpm program:check
pnpm program:fmt
pnpm program:test
pnpm program:build
pnpm program:anchor-test

# Validation
pnpm typecheck
pnpm api:typecheck
pnpm check
pnpm test
pnpm openapi:check
pnpm release:preflight

# Miner administration
pnpm miner:initialize -- <env-file>
pnpm miner:register-owner -- <env-file>
pnpm miner:register-device -- <env-file>
pnpm miner:reassign-device -- <env-file>
pnpm miner:inspect -- <env-file>

# Docker
pnpm docker:build
pnpm docker:up
pnpm docker:logs
pnpm docker:ps
pnpm docker:down
```

---

## Security model

PowerChain treats the following boundaries as non-interchangeable:

| Boundary | Responsibility |
|---|---|
| Meter / EMS | physical measurement |
| Device Ed25519 identity | origin/authenticity of node-submitted evidence |
| Evidence verifier | trust decision on physical evidence |
| Backend policy | economic calculation and tenant limits |
| Human/role approval | high-consequence authorization workflow |
| Reward-owner wallet | claim authorization |
| Miner program | deterministic on-chain settlement rules |
| PostgreSQL ledger/audit | accounting and reconciliation |

A device signature proves that an enrolled key signed a payload. It does **not** by itself prove that the physical measurement is true.

Do not place private keys, treasury authority, verifier keys, or program-upgrade authority on edge nodes or mobile clients.

Security documentation: [`docs/SECURITY.md`](docs/SECURITY.md).

---

## Documentation

Start with [`docs/README.md`](docs/README.md).

Recommended paths:

| Topic | Document |
|---|---|
| Installation | [`docs/INSTALLATION.md`](docs/INSTALLATION.md) |
| Developer guide | [`docs/DEVELOPER-GUIDE.md`](docs/DEVELOPER-GUIDE.md) |
| Operator guide | [`docs/OPERATOR-GUIDE.md`](docs/OPERATOR-GUIDE.md) |
| Architecture | [`docs/RENEWABLE-MINER-ARCHITECTURE.md`](docs/RENEWABLE-MINER-ARCHITECTURE.md) |
| Proof of Energy | [`docs/PROOF-OF-ENERGY.md`](docs/PROOF-OF-ENERGY.md) |
| Evidence verification | [`docs/EVIDENCE-VERIFICATION.md`](docs/EVIDENCE-VERIFICATION.md) |
| Chain binding | [`docs/CHAIN-BINDING.md`](docs/CHAIN-BINDING.md) |
| Claim settlement | [`docs/CLAIM-SETTLEMENT-v1.md`](docs/CLAIM-SETTLEMENT-v1.md) |
| Agent Compute | [`docs/AGENT-COMPUTE.md`](docs/AGENT-COMPUTE.md) |
| Agent setup | [`docs/AGENT-SETUP.md`](docs/AGENT-SETUP.md) |
| Docker | [`docker/README.md`](docker/README.md) |
| Testing | [`docs/TESTING.md`](docs/TESTING.md) |
| Deployment | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| Troubleshooting | [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) |

---

## Versioning and change history

`1.0.0` is the only supported product version in this repository. Database migration filenames are internal schema-evolution identifiers and do not define product versions.

See [`CHANGELOG.md`](CHANGELOG.md) for the canonical change history.

---

## Contributing

Contributions should preserve the canonical trust boundary and avoid introducing dead controls, unverifiable telemetry, hidden wallet authority, or duplicated protocol constants.

Before submitting changes:

```bash
pnpm check
pnpm test
pnpm release:preflight
```

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CONTRIBUTORS.md`](CONTRIBUTORS.md).

---

## Project principles

1. **Physical truth stays physical.** Blockchain records claims and settlement; it does not create meter truth.
2. **Evidence is explicit.** Every consequential result should be attributable to a source, verifier, policy, and actor.
3. **Economics are deterministic.** Reward arithmetic uses integer/base-unit math.
4. **Authority is separated.** Device, verifier, finance, wallet, treasury, and program authorities are distinct.
5. **Autonomy is bounded.** Agents can prepare and execute only within explicit policy and wallet authorization boundaries.
6. **Canonical contracts are shared.** Protocol constants and math belong in `@powerchain-protocol/miner`, not duplicated across apps.
7. **Fail closed.** Missing deployment configuration, unknown model routes, unreviewed build scripts, or unverifiable settlement should stop the workflow rather than silently degrade.

### Package publishing

See [npm Publishing](docs/NPM-PUBLISHING.md) for the token-free trusted-publishing path for `@powerchain-protocol/miner`.
