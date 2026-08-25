# Installation Instructions

## 1. Product monorepo development environment

Requirements:

```text
Node.js >=24.19.0 <25
Corepack
pnpm 11.23.0
PostgreSQL 17
Docker Desktop/Engine (optional when using an external PostgreSQL server)
```

Recommended:

```bash
corepack enable
pnpm bootstrap
```

The default bootstrap does not require Docker. If PostgreSQL is unavailable and Docker is not installed/running, dependency/environment setup still completes and reports:

```text
WORKSPACE_READY / DATABASE_NOT_STARTED
```

Require a ready database in the same command with:

```bash
pnpm bootstrap:db
```

The bootstrap creates local env files if they are missing and loads
`apps/backend/.env` automatically for backend/database commands.

### Docker Desktop not installed

`docker compose up` cannot work without the Docker CLI/daemon. If `pnpm doctor` reports that
Docker is unavailable, either install and start Docker Desktop or point the backend at an
existing PostgreSQL 17 instance:

```env
# apps/backend/.env
DATABASE_URL=postgres://user:password@host:5432/database
```

Then:

```bash
pnpm bootstrap
```

### Dependency lifecycle scripts

The repository uses pnpm 11 strict dependency-build review.

Reviewed policy:

```yaml
allowBuilds:
  esbuild: true
  bigint-buffer: false
  bufferutil: false
  utf-8-validate: false
```

Do not approve every transitive build script globally just to make installation pass.

Inspect current policy:

```bash
pnpm deps:build-policy
```

Inspect any newly discovered dependency build scripts:

```bash
pnpm deps:review
```

A new unreviewed lifecycle script should fail installation until it is deliberately reviewed.

### Lockfile

If `pnpm-lock.yaml` is absent, bootstrap generates it once with a non-frozen install. Commit
the resulting lockfile. Subsequent bootstrap runs use:

```bash
pnpm install --frozen-lockfile
```

### Start services

All primary web/API services:

```bash
pnpm dev:apps
```

Mobile remains a separate Expo process:

```bash
pnpm dev:mobile
```

Or run components separately:

```bash
pnpm dev:backend
pnpm dev:console
pnpm dev:compute
pnpm dev:frontend
pnpm dev:evidence
pnpm dev:verifier
```


## 2. Raspberry Pi / Linux node

```bash
sudo POWERCHAIN_SOURCE_ROOT="$PWD" ./linux/install.sh
sudoedit /etc/powerchain-miner/config.toml
sudo systemctl enable --now powerchain-miner
minerctl health
```

Use `source.kind = "mock"` only for development. Production reward eligibility requires
a reviewed physical meter/EMS source.

## 3. Devnet program

Create a devnet program keypair, sync the program ID, create the MINER Token-2022 mint,
deploy the program, initialize protocol state, fund the treasury and verify the deployment.
See `docs/DEPLOYMENT.md`.


## Evidence policy bootstrap

Before a physical node can earn rewards, configure both:

1. a **reward policy** and open reward epoch;
2. a **verification policy** for the node's renewable source.

Then assign an explicit reward owner to the device.

Without these controls a signed proof is not reward-eligible.


## Register an evidence verifier identity

Generate a dedicated keypair:

```bash
pnpm verifier:keygen
```

Keep the private PEM on the evidence-verifier host. Register the public PEM through the
Client Admin Rewards/Evidence Verifier surface.

Then configure:

```env
EVIDENCE_VERIFIER_REGISTRY_ID=<registry uuid>
EVIDENCE_VERIFIER_PRIVATE_KEY=/secure/path/evidence-verifier.pem
```

Restart `pnpm dev:evidence`.

## Verify device Solana binding

Before verified proofs can be settled:

1. assign a member with a Solana reward wallet to the device;
2. register the MinerAccount and DeviceAccount on-chain;
3. use the client device page's **Verify Solana binding** action.

Production mainnet should use a dedicated authenticated RPC, not a public shared endpoint.
