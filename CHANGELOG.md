# Changelog

All notable changes to PowerChain Renewable Miner OS are documented here.

The project uses **canonical public version `1.0.0`**. Earlier `1.1.x`, `1.2.x`, and `1.3.x` labels used during repository construction were working iteration labels, not supported public releases; their completed functionality is consolidated into `1.0.0`.

The format follows the principles of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning for the public product contract.
## [Unreleased]


### Added — Solana ecosystem, Helium and CCT

- centralized canonical SPL Token, Token-2022, Associated Token Account and Metaplex program IDs;
- added token-program classification and Metaplex Token Metadata PDA helpers;
- added Helium Solana program/token registry plus multi-gateway and Entity API clients;
- added authenticated Helium gateway/entity BFF routes and safe local-binary RPM compatibility builders;
- added Solana DePIN reference contracts without fabricating an `@solana/depin` npm dependency;
- added `programs/cct` for verifier-authorized carbon-credit batch issuance and irreversible burn retirement;
- added `@powerchain-protocol/cct` typed CCT units, PDAs, project/batch/retirement contracts and build surface;
- added SolarShare-style community DePIN contracts and a responsive public website feature section;
- added complete service READMEs and repository checks for device-agent, evidence-verifier and settlement worker boundaries.


### Organized — application architecture

- reorganized console libraries into `lib/core`, `lib/chains`, `lib/wallets`, and server-only `lib/market-data` domains;
- added explicit `lib/client` and `lib/server` runtime barrels to keep browser code away from server credentials;
- added stable `components`, `data`, `types`, `utils`, and UI barrel exports;
- retained earlier flat and misspelled paths only as documented compatibility facades;
- added `console:architecture` enforcement that rejects new imports from deprecated facades and server-only imports from client modules;
- moved migration notes and superseded working release notes under `docs/history/`;
- added `docs/PROJECT-STRUCTURE.md` and `repo:organization` to keep code ownership and documentation layout deterministic.

### Desktop UI architecture

- Added Tailwind CSS 4 + shadcn-style component primitives to `apps/console`.
- Added Radix Dialog, Dropdown Menu and Tooltip accessibility foundations.
- Added `config/`, `constants/`, `env/`, `context/`, typed `events.ts`, `types/events.ts`, `components/common/`, and `components/modals/`.
- Added canonical light/dark theme variables and wallet-connect styles.
- Replaced console shell with responsive reusable desktop navigation/header components.
- Replaced Dashboard hand-rolled modals with Radix-backed modal components.
- Added typed Next.js routes, stricter security headers, Vercel monorepo config, and hardened `proxy.ts`.

### Improved

- replaced the race-prone shared proof settlement queue with bounded PostgreSQL leases using `FOR UPDATE SKIP LOCKED`;
- added durable signed Solana settlement intents persisted before broadcast, blockhash-window recovery, and no-blind-resubmit behavior;
- added cached `/api/v1/health/chain` verification of program/config/Token-2022 treasury state and RPC freshness;
- added client-scoped role-distinct reward claim approval policies with high-value Finance + Client Admin quorum support;
- added verifier independence classes and per-policy class requirements for revenue meter/EMS/rule/manual-review evidence separation;
- added settlement lease/intent/state-recovery and pending-claim-approval Prometheus metrics;
- Corepack bootstrap now force-activates the exact `pnpm@11.23.0` project pin and warns when a stale shell shim resolves to another pnpm version;
- default `pnpm bootstrap` is now database-optional and completes as `WORKSPACE_READY / DATABASE_NOT_STARTED` when Docker/PostgreSQL is unavailable;
- added strict `pnpm bootstrap:db` and explicit `pnpm bootstrap:no-db` workflows;
- added Miner program doctor/check/build/test/format command surface;
- hardened the Anchor kernel with persisted state-version checks and non-default verifier/device/authority validation;
- added `cancel_authority_transfer` for explicit rollback of a pending two-step authority rotation;
- verifier rotation events now retain both previous and new verifier identities.

### Planned / open hardening

- production program-ID synchronization and Devnet deployment validation;
- external security review of the Anchor program and settlement flows;
- live PostgreSQL concurrency/integration test execution in CI;
- Solana local-validator/Devnet integration coverage for settlement edge cases;
- durable streaming usage reconciliation for Agent Compute before enabling streamed billing;
- production Sui funding verification if/when Sui compute top-ups are enabled.

## [1.0.0] - 2026-08-25

### Added — Miner protocol

- Anchor Miner program with protocol, Miner, Device, and ClaimReceipt accounts;
- deterministic PDAs for protocol configuration, treasury authority/vault, miners, devices, and claims;
- verifier-attested Proof-of-Energy submission;
- integer Wh and basis-point reward arithmetic;
- protocol reward ceilings, per-proof limits, observation/verification age limits, and emission cap;
- device enable/disable, verifier rotation, pause control, reward-policy updates, and two-step authority transfer;
- explicit device reassignment requiring protocol authority and new reward-owner consent;
- Token-2022 treasury reward claims using `transfer_checked`;
- one-time ClaimReceipt PDA settlement keyed by 16-byte claim ID.

### Added — Canonical protocol package

- `@powerchain-protocol/miner` as the shared TypeScript protocol contract;
- canonical PDA seeds, state constants, proof/claim types, digest helpers, reward math, and PDA derivation;
- modular `api/v1`, `cors`, `core`, `nodes`, `depin`, `solana`, `helius`, IoT, compute, AI/LLM, AI/MPC, agents, and skills namespaces;
- canonical Agent/skill authority documentation.

### Added — Control plane

- Fastify/PostgreSQL `/api/v1` backend;
- client-aware RBAC and authenticated memberships;
- device enrollment and expiring enrollment credentials;
- canonical Ed25519 device identity handling;
- deterministic Solana Device/Miner chain binding;
- proof ingestion, verification policies, signed verifier identities, dynamic quorum, and human/service verification;
- append-only reward ledger and claim holds;
- reward-claim lifecycle with independent approval and no self-approval;
- actual Solana settlement verification before database confirmation;
- two-person meter/EMS source rotation;
- tamper-evident chained audit log;
- API idempotency support;
- signed release/update metadata and runtime readiness checks.

### Added — Agent Compute

- wallet-funded Agent Compute accounts and scoped one-time API keys;
- dynamic `/v1/models` discovery;
- OpenAI-compatible Chat Completions and Responses endpoints;
- conservative usage reservations and append-only compute-credit ledger;
- model routing/rate configuration separated from public model metadata;
- bounded auto-top-up intents with daily caps;
- independently verified Solana funding transactions;
- Codex Responses-to-Chat adapter;
- Claude Code Router setup;
- reusable AgentOS/ACP skills and uploadable skill packages.

### Added — Product applications

- authenticated Next.js operator console;
- public Next.js marketing website and PWA;
- Expo/React Native mobile companion;
- shared white/light-gray/dark-green/black design system;
- responsive operational UI for devices, proofs, rewards, audit, Agent Compute, and system status.

### Added — Device and operations

- Raspberry Pi/Linux device agent with local Ed25519 identity;
- deterministic canonical proof serialization and hashing;
- SQLite durable queue with dead-letter handling and retry controls;
- HTTP JSON, Modbus TCP, registry and guarded integration boundaries;
- source hash/identity inspection commands;
- Linux/systemd packaging and appliance assets;
- evidence-verifier and settlement/verifier worker services.

### Added — Toolchain and deployment

- Node.js 24.19 baseline;
- pnpm `11.23.0` workspace with explicit dependency-build policy;
- Docker Compose stack using pinned Node/PostgreSQL images;
- hardened non-root application containers with dropped capabilities and `no-new-privileges`;
- environment doctor/bootstrap/database readiness commands;
- OpenAPI and Postman contracts;
- release preflight, structural regression tests, skill validation, and documentation suite.

### Security

- private treasury/program/verifier authority explicitly excluded from Raspberry Pi/mobile clients;
- compute API keys separated from wallet signing authority;
- role separation between request, approval, wallet authorization, settlement, and reconciliation;
- exact reward destination and Token-2022 mint/treasury verification;
- short-lived on-chain claim authorization;
- append-only financial/evidence records and audit-chain integrity controls;
- strict dependency lifecycle-script review.

### Fixed

- pnpm ignored-build/reinstall loop by committing explicit dependency build policy;
- bootstrap behavior that attempted migrations after silently skipping unavailable Docker;
- backend/compute app-local `.env` loading;
- CORS method compatibility after current Fastify CORS upgrade;
- stale public version drift by normalizing the repository to canonical `1.0.0`.

### Known constraints

- Anchor `declare_id!` remains a placeholder until deployment synchronization;
- this repository does not claim an external security audit;
- full Docker image build, live PostgreSQL concurrency suite, and live Solana integration execution depend on deployment infrastructure outside the exported source tree.
