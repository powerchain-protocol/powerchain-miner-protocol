# Contributing to PowerChain

Thank you for contributing to PowerChain Renewable Miner OS.

The repository is security-sensitive: it handles physical-energy evidence, reward accounting, wallet authorization, and blockchain settlement. Contributions should improve correctness without collapsing those trust boundaries.

## Canonical version

The public product version is `1.0.0`.

Do not bump package/app/program versions independently. A version change is a repository-wide release decision.

## Development setup

```bash
corepack enable
pnpm bootstrap
```

Diagnostics:

```bash
pnpm doctor
pnpm deps:build-policy
pnpm peers:check
```

## Before opening a change

Run the relevant checks and, for broad changes, the full suite:

```bash
pnpm typecheck
pnpm api:typecheck
pnpm check
pnpm test
pnpm openapi:check
pnpm release:preflight
```

Rust/Anchor changes should additionally run when the toolchain is available:

```bash
cargo fmt --all -- --check
cargo test --workspace
anchor build
anchor test
```

## Protocol changes

When changing PDA seeds, account layouts, reward math, proof fields, or claim encoding:

1. update `programs/miner`;
2. update `@powerchain-protocol/miner`;
3. update `@powerchain/miner-sdk` when applicable;
4. update backend decoding/verification;
5. update OpenAPI/fixtures/tests;
6. add migration/version handling for persisted account changes;
7. update program and root documentation.

Never duplicate canonical constants in application code when they belong in the protocol package.

## Database changes

- use a new forward-only migration;
- never rewrite an already-published migration to model a new change;
- use transactional/locking semantics for financial concurrency;
- preserve append-only ledgers/audit data where the existing model requires it;
- add concurrency tests for changes affecting claims, balances, leases, or settlement.

## Security-sensitive changes

Explicit review is required for changes involving:

```text
program authority
treasury authority
verifier identity
wallet signing
reward arithmetic
claim approval
settlement verification
device enrollment/signing keys
compute billing/top-up
CORS/auth/session handling
release/update signing
```

Do not commit private keys, seed phrases, wallet keypairs, production API keys, cookies, or real secrets.

## Documentation

A behavior change is incomplete if the canonical README/program/API documentation still describes the old behavior.

Update `CHANGELOG.md` under **Unreleased** for user-visible changes.

## Pull request quality

A good change should contain:

- concise rationale;
- explicit trust/security impact;
- tests for the changed behavior;
- migration plan where state changes;
- documentation updates;
- no dead buttons/routes/configuration;
- no invented external API semantics or hardware register maps.


## Miner program changes

Before submitting changes under `programs/miner/`:

```bash
pnpm program:doctor
pnpm program:check
pnpm program:fmt
pnpm program:test
```

When the Solana/Anchor integration toolchain is available, also run:

```bash
pnpm program:build
pnpm program:anchor-test
```

Do not deploy or claim deployment readiness while the placeholder program ID remains in
`declare_id!` / `Anchor.toml`.
