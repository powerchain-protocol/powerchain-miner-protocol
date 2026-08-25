# PowerChain Settlement Verifier Worker

**Version:** `1.0.0`  
**Runtime:** Node.js `24.19.x`  
**Chain:** Solana

The verifier worker is the on-chain Proof-of-Energy settlement executor. It acquires a
database lease for each verified proof, checks existing on-chain/device state, prepares a
durable settlement intent, signs the Miner instruction with the configured Solana verifier
keypair, submits it, and reconciles the exact result back into PostgreSQL.

## Settlement model

```text
verified proof
    ↓
FOR UPDATE SKIP LOCKED lease
    ↓
inspect DeviceAccount + prior intent
    ↓
prepare transaction
    ↓
persist signature/blockhash intent
    ↓
broadcast + confirm
    ↓
reconcile by transaction/state
    ↓
release lease
```

The worker never reads raw meter hardware.

## Required environment

```env
POWERCHAIN_MINER_API_URL=
POWERCHAIN_WORKER_TOKEN=
POWERCHAIN_SOLANA_RPC_URL=
POWERCHAIN_MINER_PROGRAM_ID=
POWERCHAIN_VERIFIER_KEYPAIR=
POWERCHAIN_MINER_IDL=
```

Multi-worker tuning:

```env
POWERCHAIN_WORKER_INSTANCE_ID=
POWERCHAIN_SETTLEMENT_LEASE_SECONDS=180
POWERCHAIN_SETTLEMENT_LEASE_LIMIT=25
```

## Key boundary

`POWERCHAIN_VERIFIER_KEYPAIR` is a **Solana program verifier signer**, not:

- a treasury wallet;
- a reward-owner wallet;
- a device Ed25519 key;
- a Helium gateway key;
- a CCT verifier key unless deliberately configured as the same organizational signer.

Production should use a dedicated signer and documented rotation procedure.

## Run

```bash
corepack pnpm dev:verifier
```

## Recovery

Before submitting a new transaction the worker checks:

1. whether DeviceAccount already contains the expected sequence/digest;
2. whether a prior settlement intent already has a live or confirmed signature;
3. whether the previous blockhash validity window has expired.

This prevents blind resubmission after worker crashes.
