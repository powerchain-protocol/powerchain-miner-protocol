# Deployment

## Development / Devnet

### 1. Install

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate
pnpm install --no-frozen-lockfile
```

For a tagged deterministic release, generate and commit `pnpm-lock.yaml` and use
`--frozen-lockfile`.

### 2. Database

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:smoke
```

### 3. Program identity

Generate or choose a dedicated program keypair, then:

```bash
./scripts/sync-program-id.sh <program-keypair.json>
```

This updates `declare_id!` and Anchor configuration to the real program ID.

### 4. Build and deploy

```bash
anchor build
anchor deploy --provider.cluster devnet
```

For release verification, use a verifiable build and verify the deployed program with the
current Anchor CLI.

### 5. Record deployment

Populate the environment with:

```text
POWERCHAIN_MINER_PROGRAM_ID
POWERCHAIN_MINER_MINT
POWERCHAIN_MINER_TREASURY_VAULT
VERIFIER_PUBKEY
```

Then:

```bash
node scripts/record-deployment.mjs devnet <env-file>
node scripts/verify-deployment-manifest.mjs devnet
```

### 6. Initialize protocol

```bash
pnpm miner:initialize -- <env-file>
```

### 7. Register owner and device

```bash
pnpm miner:register-owner -- <owner-env-file>
pnpm miner:register-device -- <device-env-file>
```

### 8. Verify backend readiness

```bash
curl http://localhost:3100/api/v1/health/ready
```

Readiness fails when the database or canonical Solana deployment configuration is missing.

## Mainnet-Beta

Do not activate Mainnet merely because the software version is `1.0.0`.

Before Mainnet:

- external Anchor/program security audit;
- explicit v1 account migration plan if any earlier state exists;
- multisig/governance policy for program upgrade authority;
- protected verifier and evidence-verifier keys;
- dedicated authenticated Solana RPC;
- committed dependency lockfile;
- verifiable Anchor build and deployed-program verification;
- database backup/restore rehearsal;
- audit checkpoint retention outside the primary database;
- incident/runbook testing;
- treasury liquidity and Token-2022 behavior testing.

Run:

```bash
CONFIRM_MAINNET_BETA=YES_I_UNDERSTAND \
./scripts/mainnet-preflight.sh
```

and the stronger release gate:

```bash
REQUIRE_LOCKFILE=1 \
REQUIRE_DEPLOYMENT_IDENTITIES=1 \
REQUIRE_VERIFIED_DEPLOYMENT=1 \
POWERCHAIN_DEPLOYMENT_CLUSTER=mainnet-beta \
pnpm release:preflight
```


## Deployment evidence manifest

`target/manifests/<cluster>.json` records:

- program ID;
- MINER mint;
- program treasury vault;
- verifier identity;
- source commit when Git metadata is available;
- IDL SHA-256;
- program `.so` SHA-256;
- deployment timestamp;
- verified flag and verification timestamp.

Recording a deployment resets `verified=false` unless `DEPLOYMENT_VERIFIED=true` is
explicitly supplied after verification.

A full release gate may require:

```bash
REQUIRE_INITIALIZED_DEPLOYMENT=1 \
REQUIRE_BUILD_EVIDENCE=1 \
REQUIRE_VERIFIED_DEPLOYMENT=1 \
node scripts/verify-deployment-manifest.mjs mainnet-beta
```
