# PowerChain Renewable Miner Architecture

## Canonical principle

**Physical meters provide truth. Raspberry Pi nodes sign evidence. The control plane
verifies continuity. Humans/policies govern reward policy. Solana settles MINER.**

## Components

### Raspberry Pi node
- Raspberry Pi OS Lite 64-bit
- unprivileged systemd service
- meter adapter
- Ed25519 device identity
- proof batching
- SQLite offline queue
- signed HTTPS client
- heartbeat/health reporting

### Next.js control plane
- Node enrollment
- Ed25519 request verification
- replay/sequence checks
- renewable-energy proof ingestion
- reward accrual view
- fleet health
- Solana RPC health
- responsive operator UI

### Solana
- Anchor miner program
- Token-2022 MINER mint
- program treasury vault
- verifier-gated reward accounting
- claim path

## Recommended next production boundary

The Next.js proof endpoint should enqueue accepted evidence to a verifier worker. The verifier
worker should re-run policy checks, form the on-chain `submit_verified_proof` instruction,
simulate the transaction, submit it to the configured network, and reconcile the resulting
signature back to the proof record.

Do not store a production verifier private key in a browser or Raspberry Pi.


## Verifier worker

A separate `services/verifier-worker` boundary is included. It reads accepted proofs through
an internal token-protected API and reconciles chain submission state. It intentionally
fails closed until the device's on-chain PDA is persisted by enrollment. This prevents
guessing an account mapping and accidentally rewarding the wrong hardware identity.

The next on-chain registration step is:

1. derive/register `DeviceAccount` using the enrolled Ed25519 public key;
2. persist `devicePda` in the control-plane record;
3. worker loads `devicePda` + `MinerAccount` PDA;
4. simulate `submit_verified_proof`;
5. submit using the dedicated verifier signer;
6. reconcile transaction signature and confirmation state.
