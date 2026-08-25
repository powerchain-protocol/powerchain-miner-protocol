# Signed Evidence Attestation & Quorum

Canonical v1.0.0 gives automated evidence verifiers their own Ed25519 identities and an explicit verifier class.

## Why this changed

A shared bearer token is useful as a service boundary, but it is not enough to establish an
independent verifier identity. Without a second credential, one compromised worker token
could submit arbitrary `verifierId` strings and impersonate a quorum.

v0.8 requires:

```text
evidence worker token
        +
registered verifier identity
        +
Ed25519 signature
```

## Registry

Client administrators register only the verifier public key:

```text
evidence_verifiers
├── client
├── verifier_id
├── display name
├── verifier_class
├── Ed25519 public key PEM
└── ACTIVE / REVOKED
```

The private key remains on the evidence-verifier host.

Generate a key:

```bash
pnpm verifier:keygen
```

Default output is ignored by Git under `target/keys/`.

## Signed payload

Economically relevant fields are signed:

```text
proofId
verifierRegistryId
decision
qualityBps
proofDigest
sourceHash
```

Changing the decision, verified quality, proof identity or source identity invalidates the
signature.

Informational reason/metadata fields are not used to calculate the reward and are not part
of the signed economic payload.

## Policy binding

A verification policy may attach a set of registered service verifiers.

```text
verification_policy
        │
        ├── verifier A
        ├── verifier B
        └── verifier C
```

If `allowHumanVerifiers=false`, the configured service-verifier set must be large enough to
satisfy `minAttestations`.

## Dynamic authorization

Pending quorum evaluation re-checks verifier authorization.

A service attestation stops counting toward a still-pending proof when the service identity
is revoked.

A human attestation stops counting toward a still-pending proof when the user:

- is disabled;
- loses active client membership; or
- no longer has the `VERIFIER` role.

Already finalized proofs remain historical records.

## Independence classes

A policy may require independent evidence domains rather than only a raw attestation count. Supported classes are:

```text
RULE
EMS
REVENUE_METER
UTILITY
GRID_OPERATOR
GATEWAY
SIGNED_WEBHOOK
MANUAL_REVIEW
```

Example:

```text
minAttestations = 3
REVENUE_METER × 1
EMS × 1
RULE × 1
```

Three copies of the same rule worker cannot satisfy that policy. Human verifier approvals count as `MANUAL_REVIEW`.
