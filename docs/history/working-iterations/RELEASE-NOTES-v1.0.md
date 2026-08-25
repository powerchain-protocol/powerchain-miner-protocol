# PowerChain Renewable Miner OS v1.0.0 — Release Notes

## Canonical architecture

v1.0 establishes one production execution model:

```text
physical evidence
→ signed node proof
→ evidence quorum
→ verified reward
→ append-only ledger
→ independent claim approval
→ owner wallet authorization
→ Anchor claim_rewards
→ program treasury Token-2022 transfer
→ ClaimReceipt
→ API reconciliation
→ tamper-evident audit
```

## Major changes from v0.9

### Economics

- active reward policies cannot overlap for the same client/source;
- active reward epochs cannot overlap for the same policy;
- reward ledger is append-only;
- claim self-approval is forbidden for every role;
- approved claim amount must also be available on-chain before wallet signing.

### Solana settlement

- one-time `ClaimReceipt` PDA per claim UUID;
- short-lived on-chain claim authorization;
- program-owned Token-2022 treasury remains the only reward source;
- reward owner signs the claim transaction;
- browser may create the owner's Token-2022 ATA idempotently;
- backend verifies program invocation, receipt, vault, mint, destination and exact amount;
- prepared cancellation requires expiry, safety delay and finalized receipt absence.

### Program state

`state_version = 1` is persisted in:

- ProtocolConfig;
- MinerAccount;
- DeviceAccount;
- ClaimReceipt.

Device owner changes use explicit `reassign_device` with protocol authority plus new-owner
signature.

### Chain verification

Backend chain binding now decodes v1 account data and checks:

- Anchor discriminator;
- state version;
- device signing key;
- DeviceAccount → MinerAccount binding;
- MinerAccount → reward-owner wallet.

### Proof settlement

The verifier worker can recover a proof from DeviceAccount sequence + digest if Solana
accepted the transaction but the worker crashed before persisting the signature.

Reconciliation provenance is recorded as:

- `TRANSACTION`; or
- `STATE`.

### Audit

- audit events are hash chained;
- audit rows are append-only;
- audit checkpoints are append-only;
- checkpoints can be exported from `/audit`.

### Release engineering

- `packages/miner-sdk` provides canonical PDAs and admin commands;
- deployment manifests contain source/build evidence hashes when available;
- PostgreSQL DB invariant smoke test added;
- GitHub CI includes application, DB and Rust jobs;
- release preflight rejects non-canonical deployment identity when strict gates are enabled.

## Explicit release blockers

The source archive deliberately retains two visible blockers:

1. `programs/miner/src/lib.rs` still contains the placeholder program ID until
   `scripts/sync-program-id.sh` is run.
2. `pnpm-lock.yaml` is not yet committed.

Therefore v1.0.0 is the canonical software architecture/release candidate, not a claim of a
verified Mainnet deployment.

Before a tagged production release:

- generate and commit the pnpm lockfile;
- sync the real program ID;
- build and test with Rust/Anchor;
- use an Anchor verifiable build;
- verify the deployed program;
- populate and verify the initialized deployment manifest;
- complete the external security review / program audit.
