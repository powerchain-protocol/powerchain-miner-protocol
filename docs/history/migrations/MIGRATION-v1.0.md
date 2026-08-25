# Migration to PowerChain Renewable Miner OS v1.0.0

v1.0 is the first canonical production architecture. It deliberately converts several
previously soft assumptions into explicit database and on-chain invariants.

## 1. PostgreSQL

Run:

```bash
pnpm db:migrate
pnpm db:smoke
```

Migration `007_v100_economic_invariants.sql`:

- fails if overlapping active reward policies already exist;
- fails if overlapping active reward epochs already exist;
- makes `reward_ledger` append-only;
- validates ledger entry sign semantics;
- makes new application-level `audit_logs` immutable;
- adds canonical claim preparation/receipt fields;
- preserves unverifiable historical settlements with
  `legacy_settlement_unverified=true`;
- adds audit checkpoints;
- adds claim-state consistency constraints.

Resolve all overlap errors explicitly. Do not edit migration SQL merely to force an invalid
economic state through deployment.

## 2. Breaking Anchor account layout

v1 adds `state_version` to:

- `ProtocolConfig`;
- `MinerAccount`;
- `DeviceAccount`.

It also adds `ClaimReceipt`.

Do **not** run the v1 binary against earlier initialized accounts without an audited account
migration.

For Devnet, the recommended path is:

1. generate/sync a fresh v1 program ID;
2. deploy v1;
3. initialize fresh protocol state;
4. register test reward owners and devices again.

For existing Mainnet state, design and audit a dedicated migration before upgrading the
program.

## 3. Program identity

The repository intentionally ships with:

```rust
declare_id!("11111111111111111111111111111111");
```

as a non-deployable placeholder.

Before Devnet deployment:

```bash
./scripts/sync-program-id.sh <program-keypair.json>
```

Then:

```bash
pnpm deployment:verify -- devnet
```

The release preflight rejects the placeholder when deployment identity checks are enabled.

## 4. Deterministic dependencies

A tagged production release should commit `pnpm-lock.yaml`.

Until the lockfile is generated, CI uses:

```bash
pnpm install --no-frozen-lockfile
```

This is intentionally visible. Do not describe the current archive as a bit-for-bit
dependency-pinned release until a lockfile is committed.

## 5. Initialize the program

After building/deploying and creating MINER:

```bash
pnpm miner:initialize -- config/miner.devnet.env
```

The command prints:

- config PDA;
- treasury authority PDA;
- treasury vault PDA;
- initialization transaction.

Copy the canonical values into the Miner API environment and deployment manifest.

## 6. Register reward owners

For Devnet/bootstrap testing:

```bash
pnpm miner:register-owner -- config/owner.devnet.env
```

The owner creates its own MinerAccount.

For production, prefer the user's wallet or an approved organizational signing workflow
rather than moving user keys into server-side files.

## 7. Register physical devices

After the control plane has the Pi/Linux Ed25519 public identity:

```bash
pnpm miner:register-device -- config/device.devnet.env
```

The command derives the same DeviceAccount PDA used by the backend chain-binding verifier.

## 8. Claims

v0.x operator/treasury-wallet settlement assumptions are replaced by:

```text
REQUESTED
→ independent APPROVED
→ PREPARED short-lived wallet authorization
→ owner-signed claim_rewards
→ ClaimReceipt
→ reconciled CONFIRMED
```

See `docs/CLAIM-SETTLEMENT-v1.md`.

## 9. Audit

Create exportable checkpoints periodically:

```text
POST /api/v1/audit/checkpoints
```

The checkpoint commits to the current audit head and can be retained outside PostgreSQL.

## 10. Release gate

Run:

```bash
pnpm release:preflight
```

For a deployable release:

```bash
REQUIRE_LOCKFILE=1 \
REQUIRE_DEPLOYMENT_IDENTITIES=1 \
POWERCHAIN_DEPLOYMENT_CLUSTER=devnet \
pnpm release:preflight
```
