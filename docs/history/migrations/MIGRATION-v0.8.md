# Migration to v0.8

## Database

```bash
pnpm db:migrate
```

`005_v08_identity_attestation.sql` adds:

- expiring device enrollment keys;
- canonical device signing public keys;
- chain-binding verification state;
- registered evidence-verifier identities;
- policy-to-verifier assignments;
- signed service-attestation metadata;
- explicit human attestor IDs.

## Existing Raspberry Pi nodes

v0.8 nodes enroll with `publicKeyRawBase64`.

Existing nodes that are already enrolled do not need to erase their identity. On their next
valid signed heartbeat, the backend derives the canonical Solana-compatible Ed25519 public
key from the stored PEM and backfills `device_signing_pubkey`.

## Device enrollment keys

New keys expire. Default UI lifetime is one hour.

The API supports 5 minutes to 24 hours.

Create a fresh enrollment key rather than keeping bootstrap credentials permanently on a
site controller.

## Evidence workers

Generate a dedicated verifier identity:

```bash
pnpm verifier:keygen
```

Register its public key in `/rewards`, then copy the returned registry UUID into:

```env
EVIDENCE_VERIFIER_REGISTRY_ID=
EVIDENCE_VERIFIER_PRIVATE_KEY=/secure/path/evidence-verifier.pem
```

A verification policy must explicitly select the registered service verifier when it should
participate in that policy.

The shared `POWERCHAIN_EVIDENCE_WORKER_TOKEN` remains an API service credential, but is no
longer sufficient to fabricate a verifier identity.

## Solana chain binding

Old manually supplied PDA fields are no longer trusted.

Assign a device owner/reward wallet and run the new chain-binding verification workflow.
Only VERIFIED bindings enter the settlement queue.
