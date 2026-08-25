# Deployment

## Development / Devnet

### 1. Install

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate
corepack pnpm install --no-frozen-lockfile
```

For a tagged deterministic release, generate and commit `pnpm-lock.yaml` and use
`--frozen-lockfile`.

### 2. Database

```bash
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm db:smoke
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
corepack pnpm miner:initialize -- <env-file>
```

### 7. Register owner and device

```bash
corepack pnpm miner:register-owner -- <owner-env-file>
corepack pnpm miner:register-device -- <device-env-file>
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
corepack pnpm release:preflight
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


## Multiple PowerChain programs

Canonical `1.0.0` now contains two independent Anchor programs:

```text
programs/miner
programs/cct
```

Both source artifacts use placeholder IDs until synchronized.

Miner:

```bash
corepack pnpm program:miner:sync-id -- devnet /secure/miner-keypair.json
```

CCT:

```bash
corepack pnpm program:cct:sync-id -- devnet /secure/cct-keypair.json
```

Use separate deployment/upgrade-authority policy where practical. CCT issuance and Miner
energy-reward settlement are different economic domains.

Before CCT activation also verify:

- CCT mint owner is the intended SPL Token or Token-2022 program;
- mint decimals are exactly `6`;
- CCT mint authority is the canonical `cct-mint-authority` PDA;
- `POWERCHAIN_CCT_MINT` matches the deployed mint;
- verifier identity and project evidence policy are approved;
- token metadata/Metaplex records match the deployment manifest.

## Helium edge deployment

PowerChain does not redistribute an unpinned Helium "latest" binary. For RHEL/Fedora-style
edge images, build compatibility RPMs only from an explicitly acquired and verified upstream
binary:

```bash
HELIUM_BINARY=/secure/build/helium_gateway \
HELIUM_VERSION=<verified-version> \
./linux/rpm/helium/build-rpm.sh gateway
```

For multi-gateway, keep `read_api_key` and `write_api_key` outside source control and bind the
REST API to a private interface unless remote access is deliberately protected.
