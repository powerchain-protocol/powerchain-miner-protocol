# Proof of Energy (PoE)

## Definition

Proof of Energy is a cryptographically signed evidence batch representing energy measured
from an approved renewable-energy or energy-infrastructure source.

It is **not** Solana consensus and it is **not** Proof of Work.

## Canonical transport fields

- `sequence`
- `observedAt`
- `renewableType`
- `energyDeltaWh`
- `averagePowerW`
- `sampleCount`
- `source`
- `qualityBps`
- `sourceHash`
- `previousDigest`

The exact schema is in `data/schema/proof-of-energy-v1.schema.json`.

## Evidence chain

```text
Meter samples
    ↓
integer Wh integration
    ↓
source identity hash
    ↓
previous proof digest
    ↓
canonical JSON
    ↓
SHA-256 digest
    ↓
Ed25519 device signature
```

## Quality

`qualityBps` is 1–10,000.

10,000 means 100% reward weight. For example:

```text
1,000 Wh × 9,500 / 10,000 = 950 effective Wh
```

The node may report a local `qualityBps` telemetry signal, but that value is **not**
authoritative for reward calculation. The backend reward policy/verifier supplies the
verified quality basis points used for accrual. This prevents a node from choosing its own
reward multiplier.

## On-chain normalization

The Solana program stores the normalized evidence digest, sequence, source hash and integer
Wh. Detailed telemetry remains off-chain. The verifier attests that the off-chain evidence
matches the on-chain normalized proof.

## Replay protection

A proof must:
1. have a sequence greater than the device's last sequence;
2. reference the previous accepted digest after the first proof;
3. be inside the allowed clock window;
4. use a non-zero proof/source digest;
5. remain inside configured energy/reward limits.


## Source continuity

After the first accepted proof, the backend requires both:

- `previousDigest` to equal the most recently accepted proof digest;
- `sourceHash` to remain equal to the enrolled/previous physical source identity.

A legitimate meter/EMS replacement must therefore go through an explicit source-rotation
or re-enrollment process instead of silently changing the evidence origin.


## Exact reward alignment

The device transport proof does not choose its MINER reward.

After evidence verification, the backend calculates tenant-specific `reward_base_units`.
The settlement worker submits that exact amount to the Solana program. The program treats
its configured rate as a **maximum protocol ceiling**, preventing the backend from submitting
a reward above the allowed quality-adjusted Wh rate.

This keeps PostgreSQL reward accounting and on-chain miner accrual consistent.


## Observation time vs verification time

v0.7 separates:

- `observedAt` — when the physical energy was measured;
- `verifiedAt` — when the evidence quorum finalized the proof;
- Solana submission time — when the settlement transaction executes.

This is required for intermittently connected renewable sites.

The backend verification policy controls the accepted delayed-submission window. The
Solana program additionally enforces a protocol-wide `max_observation_age_secs` ceiling.

`max_proof_age_secs` now means the maximum delay from **evidence verification to on-chain
settlement**, not from physical observation to settlement.

## Raw continuity vs on-chain continuity

The backend maintains the complete received proof chain:

```text
proof A → proof B → proof C
```

even when B is later rejected economically.

The Solana program therefore enforces monotonic sequence for **verified** proofs rather than
requiring the raw `previousDigest` to equal the previous on-chain digest. Otherwise one
legitimate off-chain rejection would make every later verified proof impossible to settle.

`previousDigest` remains part of the attested payload for provenance.
