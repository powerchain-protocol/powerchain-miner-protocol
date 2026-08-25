# Installation Instructions

## 1. Backend development environment

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/console/.env.example apps/console/.env.local

docker compose up -d postgres
corepack enable
corepack use pnpm@11.22.0
pnpm install
pnpm db:migrate
pnpm db:seed
```

Start the complete control plane:

```bash
pnpm dev:api
pnpm dev
pnpm dev:evidence
pnpm dev:verifier
```

For local UI/API work where blockchain settlement is not needed, the last worker may remain
stopped. Proofs will stay `VERIFIED`/pending-chain rather than being submitted to Solana.

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
