# PowerChain Renewable Miner OS

**Version:** 1.0.0  
**Network:** Solana Devnet / Mainnet-Beta  
**Reward asset:** PowerChain Miner (`MINER`) — Token-2022  
**Node:** Raspberry Pi / Linux  
**Protocol:** Proof of Energy (PoE)

PowerChain Renewable Miner OS is a DePIN-style renewable-energy measurement, evidence,
reward and settlement stack. It turns **verified physical renewable-energy activity** into
signed Proof-of-Energy records and controlled MINER reward accounting.

It does not mine SOL and it does not use wasteful Proof-of-Work computation.

## Canonical control principle

> Physical meters provide truth.  
> Raspberry Pi/Linux nodes sign evidence.  
> Backend policies calculate rewards.  
> Verifiers attest evidence.  
> Finance approves claims.  
> Solana settles MINER.  
> The audit ledger records the result.


## v1.0 canonical production architecture

v1.0 freezes one authoritative path for energy evidence, reward accounting and MINER
settlement:

```text
physical meter / EMS
        ↓
Pi/Linux Ed25519 Proof of Energy
        ↓
PostgreSQL PENDING proof
        ↓
signed evidence-verifier quorum
        ↓
VERIFIED
        ↓
bigint reward policy + append-only ledger
        ↓
member REQUESTED claim
        ↓
independent Finance APPROVED
        ↓
short-lived claim_rewards authorization
        ↓
reward owner signs with Solana wallet
        ↓
Miner Anchor program
        ↓
program-owned Token-2022 treasury vault
        ↓
one-time ClaimReceipt PDA
        ↓
API reconciliation
        ↓
CONFIRMED settlement + tamper-evident audit
```

The control boundary is explicit:

> **Physical systems provide measurement truth. Evidence verifiers decide trust. Backend
> policy calculates economics. Finance approves claims. Reward-owner wallets authorize
> spending. The Miner program executes. PostgreSQL reconciles and audits.**

### v1 economic invariants

- active reward policies cannot overlap for the same client/source;
- active reward epochs cannot overlap for the same policy;
- `reward_ledger` is append-only;
- audit history and audit checkpoints are append-only;
- reward claims cannot be self-approved, including by SuperAdmin;
- prepared wallet authorizations expire;
- one claim UUID maps to one `ClaimReceipt` PDA;
- a settlement is confirmed only after the API verifies the actual Miner-program and
  Token-2022 transaction;
- runtime readiness fails on missing/placeholder Solana deployment configuration.

### Release status

`1.0.0` is the canonical PowerChain Renewable Miner OS + Agent Compute release. It is **not** a claim that the
Anchor program has received an external security audit or that the supplied placeholder
program ID is deployable. Before Mainnet-Beta, complete the release gates in
`docs/MIGRATION-v1.0.md` and `docs/DEPLOYMENT.md`.


## Product and UI architecture

The protocol remains v1. The product layer is now a clean monorepo:

```text
backend       authoritative API + PostgreSQL
console       authenticated operations
frontend      public website + PWA
mobile        Expo companion
design-system shared visual tokens
api-client    shared /api/v1 boundary
```

The canonical visual system is:

```text
white
light gray
dark green
black / charcoal
```

No purple gradients, neon crypto accents, or rainbow charts are part of the product design.

See `docs/DESIGN-GUIDE.md`.



## Agent Compute

Agent Compute gives a PowerChain AgentOS agent one funded compute identity:

```text
Agent identity
      +
Agent wallet
      +
Compute account
      +
Scoped API key
      ↓
https://compute.powerchain.energy/v1
      ↓
request reservation
      ↓
hosted compute
      ↓
token usage
      ↓
append-only compute ledger
```

Features:

- wallet-funded compute credit;
- one-time `pc_compute_*` API keys;
- OpenAI-compatible `/v1/chat/completions`;
- OpenAI-compatible `/v1/responses`;
- public model discovery;
- account/balance endpoint;
- low-balance auto-top-up intents;
- preferred funding chain/asset;
- top-up amount and daily autonomous cap;
- Solana wallet-payment verification;
- local Codex/OpenAI proxy;
- basic Claude Code message adapter.

The compute API key never signs wallet transfers. Auto-top-up creates an exact payment quote;
the AgentOS wallet policy remains the final authorization boundary.

See [`docs/AGENT-COMPUTE.md`](docs/AGENT-COMPUTE.md).



## Agent setup and model routing

Model IDs are discovered from:

```text
https://compute.powerchain.energy/v1/models
```

The bundled catalog is not treated as the runtime source of truth.

Reusable setup assets now live under:

```text
skills/
utilities/model-routing/
scripts/configure-*-powerchain-apc.mjs
Makefile
```

Quick setup:

```bash
export POWERCHAIN_COMPUTE_API_KEY=pc_compute_...

make models
make codex-setup MODEL=openai-gpt-55
make codex-proxy

# or
make claude-setup MODEL=claude-sonnet-4-6
```

Codex uses a local Responses-to-Chat translator. Claude Code uses Claude Code Router.
Both global configuration switchers retain a restore point and refuse to overwrite later
user modifications during restoration unless forced explicitly.

See:

- `docs/AVAILABLE-MODELS.md`
- `docs/AGENT-SETUP.md`
- `skills/acp-builder-setup/SKILL.md`



## Canonical development reliability

The local development path is now deterministic:

```text
doctor
  ↓
pnpm policy validation
  ↓
one dependency install
  ↓
PostgreSQL reachable?
  ├── yes → continue
  └── no  → Docker available/running?
              ├── yes → compose + wait
              └── no  → fail with external-DB/Docker instructions
  ↓
migration
  ↓
seed
```

This fixes the repeated `ERR_PNPM_IGNORED_BUILDS` / automatic reinstall loop and the previous
bootstrap behavior that skipped a missing Docker binary but still attempted database
migrations.


## Architecture

```text
Solar / Wind / Hydro / Battery / EV
                 │
          Meter / EMS / BMS
                 │
                 ▼
      Raspberry Pi / Linux Node
      ├─ measurement adapter
      ├─ local Ed25519 identity
      ├─ Proof of Energy builder
      └─ offline SQLite queue
                 │
          signed HTTPS evidence
                 ▼
       PowerChain Miner Backend
       ├─ clients / memberships
       ├─ RBAC
       ├─ devices
       ├─ proofs
       ├─ reward policies
       ├─ reward epochs
       ├─ reward ledger
       ├─ claims
       └─ audit logs
                 │
                 ▼
           Verifier Worker
                 │
                 ▼
        Solana Anchor Program
        ├─ ProtocolConfig PDA
        ├─ MinerAccount PDA
        ├─ DeviceAccount PDA
        └─ Treasury Vault PDA
                 │
                 ▼
          Token-2022 MINER
```

## Proof of Energy

A PoE batch carries:

```text
sequence
observed timestamp
renewable source type
integer energy Wh
average power W
sample count
quality basis points
source identity hash
previous proof digest
proof digest + Ed25519 signature
```

Reward accounting uses integer arithmetic:

```text
effective_wh = energy_wh × quality_bps / 10,000
reward = effective_wh × MINER_base_units_per_Wh
```

See [`docs/PROOF-OF-ENERGY.md`](docs/PROOF-OF-ENERGY.md).


## Canonical release policy

`1.0.0` is the only supported product version for this repository.

The earlier `1.1.x`, `1.2.x`, and `1.3.x` labels were working iteration numbers used while
the architecture was being hardened. Their functionality has been folded into this canonical
`1.0.0` release and they are not treated as separate public product versions.

Canonical product boundaries:

```text
apps/backend    authoritative Fastify/PostgreSQL control plane
apps/console    authenticated operator console
apps/compute    Agent Compute data plane
apps/frontend   marketing website + PWA
apps/mobile     Expo / React Native companion

packages/agent-compute
packages/api-client
packages/design-system
packages/miner-sdk

programs/miner
services/device-agent
services/evidence-verifier
services/verifier-worker
```

Canonical API boundaries:

```text
Control plane   /api/v1/*
Compute         https://compute.powerchain.energy/v1/*
```


## Repository

```text
.
├── apps/
│   ├── backend/             Fastify + PostgreSQL canonical /api/v1
│   ├── console/             authenticated Next.js operations console
│   ├── compute/             compute.powerchain.energy OpenAI-compatible data plane
│   ├── frontend/            marketing website + installable PWA
│   └── mobile/              Expo / React Native companion
├── packages/
│   ├── agent-compute/       compute keys, metering and Solana top-up helpers
│   ├── api-client/          shared runtime-neutral /api/v1 client
│   ├── design-system/       white/gray/green/black design tokens
│   └── miner-sdk/           Anchor/Solana administration SDK
├── programs/miner/          Anchor/Solana Miner program
├── services/
│   ├── device-agent/        Raspberry Pi/Linux node
│   ├── evidence-verifier/
│   └── verifier-worker/
├── linux/                   generic Linux/systemd distribution
├── os/                      Raspberry Pi appliance profile
├── ems/                     EMS profiles
├── integrations/            integration boundaries
├── command/                 minerctl
├── scripts/                 build/deploy/validation automation
├── tests/                   protocol/node/product tests
├── data/                    schemas + fixtures
├── utils/                   deterministic cross-runtime utilities
├── target/                  deployment manifests/generated outputs
├── config/                  devnet/mainnet examples
└── docs/                    documentation
```

### Product surfaces

| App | Purpose | Default dev port |
|---|---|---:|
| `apps/backend` | authoritative API/control plane | `3100` |
| `apps/console` | authenticated operations | `3000` |
| `apps/compute` | agent compute data plane | `3200` |
| `apps/frontend` | marketing + PWA | `3002` |
| `apps/mobile` | Expo companion | Expo dev server |

The applications share contracts and tokens through packages; **apps do not import other
apps**.

## Roles

| Role | Scope | Responsibility |
|---|---|---|
| `SUPERADMIN` | Platform | clients, platform controls, audit, releases; never substitutes for the reward-owner wallet |
| `CLIENT_ADMIN` | Client | members, nodes, reward policy |
| `OPERATOR` | Client | node operations |
| `VERIFIER` | Client | evidence verification |
| `FINANCE` | Client | epochs and claim approval |
| `VIEWER` | Client | read-only |

## Quick start — product monorepo

Run the repository bootstrap instead of pasting every command manually:

```bash
corepack enable
pnpm bootstrap
```

`pnpm bootstrap` now:

1. pins/checks pnpm `11.22.0`;
2. creates missing local `.env` files from the examples;
3. verifies the committed dependency build-script policy;
4. installs dependencies once;
5. uses a committed lockfile when present, otherwise generates one once;
6. starts PostgreSQL through Docker **only when an external PostgreSQL endpoint is not already reachable**;
7. waits for PostgreSQL before running migrations;
8. runs migrations and seed data.

If Docker is not installed, the bootstrap stops with an actionable error instead of silently
skipping Docker and then failing during `db:migrate`.

macOS options:

```text
A. Install/start Docker Desktop, then rerun `pnpm bootstrap`.

B. Use an existing PostgreSQL 17 server and set DATABASE_URL in:
   apps/backend/.env
```

The backend and compute services load their app-local `.env` files automatically. Shell
environment variables still take precedence.

After bootstrap, start all web/API services together:

```bash
pnpm dev:apps
```

or in separate terminals:

```bash
pnpm dev:backend
pnpm dev:console
pnpm dev:compute
pnpm dev:frontend
pnpm dev:mobile
```

Development diagnostics:

```bash
pnpm doctor
pnpm deps:build-policy
pnpm peers:check
```

Local surfaces:

```text
Console     http://localhost:3000
API         http://localhost:3100/api/v1
Compute     http://localhost:3200/v1
Marketing   http://localhost:3002
Mobile      Expo development server
```

Build/typecheck:

```bash
pnpm typecheck
pnpm api:typecheck
pnpm build:web
```

### pnpm dependency-build policy

pnpm 11 blocks dependency lifecycle scripts until they are explicitly reviewed. This
repository commits the review in `pnpm-workspace.yaml`:

```yaml
strictDepBuilds: true

allowBuilds:
  esbuild: true
  bigint-buffer: false
  bufferutil: false
  utf-8-validate: false
```

`esbuild` is allowed because the TypeScript/Next/Expo development toolchain requires its
platform binary. The other three are optional native acceleration packages and remain
explicitly denied, using their JavaScript fallbacks.

The repository also sets:

```yaml
verifyDepsBeforeRun: error
```

so a later `pnpm run` will not silently trigger another full workspace install. If dependency
state is stale, pnpm fails and tells you to run `pnpm install` explicitly.


## Quick start — Raspberry Pi/Linux

```bash
sudo POWERCHAIN_SOURCE_ROOT="$PWD" ./linux/install.sh
sudoedit /etc/powerchain-miner/config.toml
sudo systemctl enable --now powerchain-miner

minerctl health
minerctl logs
```

For development use `source.kind = "mock"`. Production rewards require a reviewed physical
meter/EMS integration.

## Developer commands

```bash
./scripts/bootstrap-dev.sh
./scripts/check.sh
./scripts/test.sh
./scripts/build.sh
```

## Devnet / mainnet-beta

Network environments are strictly separated.

```text
DEVNET                         MAINNET-BETA
program ID             !=     program ID
MINER mint              !=     MINER mint
treasury                !=     treasury
verifier                !=     verifier
program keypair         !=     program keypair
deployment manifest     !=     deployment manifest
```

Do not reuse devnet authorities on mainnet-beta.

## Documentation

Start with [`docs/README.md`](docs/README.md).

- [Agent Compute](docs/AGENT-COMPUTE.md)
- [Design Guide](docs/DESIGN-GUIDE.md)
- [Monorepo](docs/MONOREPO.md)
- [User Guide](docs/USER-GUIDE.md)
- [Installation](docs/INSTALLATION.md)
- [Operator Guide](docs/OPERATOR-GUIDE.md)
- [Developer Guide](docs/DEVELOPER-GUIDE.md)
- [Proof of Energy](docs/PROOF-OF-ENERGY.md)
- [Linux](docs/LINUX.md)
- [EMS / Integrations](docs/INTEGRATIONS.md)
- [Commands](docs/COMMANDS.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Migration to v0.4](docs/MIGRATION-v0.4.md)
- [Security](docs/SECURITY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Production status

This repository is an implementation scaffold and engineering reference, **not an audited
mainnet release**. Production activation requires program/application security review,
hardware integration validation, deterministic build verification, key-management controls,
treasury reconciliation, observability, backups and incident-response procedures.


## v0.5 production hardening

- PostgreSQL is now the authoritative verifier/proof settlement source.
- Verifier worker simulates Anchor instructions before sending.
- Proof settlement records bounded retries and Solana confirmation timestamps.
- Devices support explicit on-chain Device/ Miner PDA binding.
- Source rotations are auditable instead of silently changing a meter identity.
- Database migrations are forward-only and tracked.
- Reward claim ledger entries gain claim-level idempotency.
- API rate limiting, Prometheus metrics, liveness and readiness are included.
- Linux/Raspberry Pi release manifests are signed and SHA-256 verified.
- `minerctl diagnostics` and `minerctl update-check` are included.
- OpenAPI and Postman assets live under `apps/backend/`.

Production settlement path:

```text
Raspberry Pi → Miner API/PostgreSQL → Verifier Worker → Solana → reconciliation
```

The legacy Next.js JSON store is a preview/UI compatibility surface only.


## v0.6 evidence trust model

Version 0.6 removes the assumption that a correctly signed Raspberry Pi measurement is
automatically reward-worthy.

```text
SIGNED DEVICE PROOF
       ↓
    RECEIVED
       ↓
EVIDENCE ATTESTATION / QUORUM
       ↓
    VERIFIED
       ↓
TENANT REWARD CALCULATION
       ↓
   REWARD LEDGER
       ↓
SETTLEMENT VERIFIER
       ↓
     SOLANA
```

Additional changes:

- `/proofs` is now an authenticated verifier review workspace;
- client admins configure Proof-of-Energy verification policies;
- devices require an explicit reward owner before accrual finalizes;
- anonymous client ledger balances can no longer be claimed by arbitrary users;
- backend and on-chain reward amounts are aligned exactly;
- the on-chain rate is a maximum safety ceiling rather than a second independent reward calculation;
- the settlement worker follows the Anchor 1.x `@anchor-lang/core` client model;
- legacy Next.js device-ingestion endpoints are disabled by default;
- Next.js state-changing proxy routes use same-origin checks and stricter cookies.

Run the complete development pipeline:

```bash
pnpm dev:api
pnpm dev
pnpm dev:evidence
pnpm dev:verifier
```


## v0.7 logic hardening

The v0.7 pass focuses on correctness under real node/network failure.

### Physical energy

- missing meter telemetry is never extrapolated into fabricated Wh;
- fractional Wh is preserved between proof windows;
- sampling math is isolated in `EnergyAccumulator`;
- state writes are atomic and fsync-backed;
- queue state repairs sequence/digest state after a power-loss edge case.

### Durable proof delivery

- proof retries are idempotent by device + sequence + digest;
- temporary reward/epoch/verifier configuration returns HTTP 425 and is retried;
- queue retries use bounded exponential backoff;
- integrity failures go to a visible dead-letter state rather than being deleted;
- operators can inspect/retry blocked chains with `minerctl`.

### Reward/claim correctness

- reward calculation is a reusable bigint domain function;
- reward-policy rows serialize daily-cap consumption under concurrent finalization;
- claim balance check + hold creation now happen under the same user/membership lock;
- configured member reward wallets are enforced during claim requests;
- requester/approver separation remains;
- claims support cancellation and deterministic state transitions.

### Offline renewable sites

Proofs are no longer rejected merely because the site was disconnected for 15 minutes.
Each verification policy controls its accepted delayed-submission window.

See:

- `docs/LOGIC-FUNCTIONS.md`
- `docs/MIGRATION-v0.7.md`


### Delayed renewable evidence

Proof time is explicitly split into physical observation and evidence verification. This
allows a remote node to reconnect later without weakening the requirement that verified
evidence be submitted to Solana promptly after verification.


## v0.8 identity and quorum hardening

v0.8 strengthens the two identities that control the protocol's trust model.

### Evidence verifier identity

```text
shared worker token
        +
registered Ed25519 verifier key
        +
policy assignment
        ↓
signed attestation
```

One service token can no longer claim to be an arbitrary number of independent verifiers.

Pending quorum also dynamically excludes revoked service identities and users who have lost
the `VERIFIER` role.

### Device identity → Solana

```text
Pi Ed25519 raw key
       ↓
DeviceAccount PDA

assigned reward wallet
       ↓
MinerAccount PDA
```

The Raspberry Pi cannot assign a reward owner or provide its own PDA mapping.

The backend derives the addresses and verifies the accounts against Solana before setting:

```text
chain_binding_status = VERIFIED
```

The settlement worker refuses unverified mappings.

### Enrollment hardening

Client device API keys now have explicit expiration. New keys default to one hour and may be
configured from 5 minutes to 24 hours.

### Wallet hardening

Member reward wallets and reward-claim destinations must be canonical Solana public keys.
Claims require a configured member reward wallet and cannot redirect funds to an arbitrary
destination.

See:

- `docs/ATTESTATION-QUORUM.md`
- `docs/CHAIN-BINDING.md`
- `docs/MIGRATION-v0.8.md`


## v0.9 production controls

### Tamper-evident audit

Every new audit event is hash-chained inside a platform or client scope. `/audit` now shows
chain integrity and paginated activity history.

### Financial idempotency

Reward claim creation accepts `Idempotency-Key`. The console supplies a stable key so a
double click or uncertain HTTP retry cannot create duplicate claim holds.

### Verified settlement

A claim is no longer confirmed from an operator-provided Solana signature alone.

The API retrieves the transaction and verifies:

```text
Token-2022
configured MINER mint
configured client treasury owner
member reward-wallet owner
exact claim amount
successful transaction
```

### Two-person source rotation

Meter/EMS identity changes now require request + independent approval. The requester cannot
self-approve, including SuperAdmin.

An approval is consumed only by the first valid signed proof from the explicitly approved
new source.

### Operator tooling

```bash
minerctl identity-raw
minerctl source-hash
```

make canonical device/source identities directly inspectable on Linux/Raspberry Pi.

See:

- `docs/AUDIT-INTEGRITY.md`
- `docs/FINANCIAL-IDEMPOTENCY.md`
- `docs/SETTLEMENT-VERIFICATION.md`
- `docs/SOURCE-ROTATION.md`
- `docs/MIGRATION-v0.9.md`


## v1.0 release controls

Reusable Anchor administration is in:

```text
packages/miner-sdk/
```

Core commands:

```bash
pnpm miner:initialize -- <env-file>
pnpm miner:register-owner -- <env-file>
pnpm miner:register-device -- <env-file>
pnpm miner:reassign-device -- <env-file>
pnpm miner:inspect -- <env-file>

pnpm db:smoke
pnpm deployment:verify -- devnet
pnpm release:preflight
```

For a tagged deterministic deployment, generate and commit `pnpm-lock.yaml`, replace the
placeholder program ID, build/deploy with the reviewed Anchor toolchain, use a verifiable
build, verify the deployed program, and record the verified deployment manifest.

Claim settlement documentation:

- `docs/CLAIM-SETTLEMENT-v1.md`
- `docs/MIGRATION-v1.0.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
