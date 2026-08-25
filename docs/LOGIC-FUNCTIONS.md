# Logic & Functions

Version 0.7 moves critical behavior out of route handlers and the Raspberry Pi main loop.

## Backend domain functions

### `domain/rewards.ts`

`calculateReward(input)`

```text
physical Wh
   ×
verified quality bps / 10,000
   =
effective Wh
   ×
tenant base units / Wh
   ↓
per-proof cap
   ↓
daily cap
   =
reward base units
```

All monetary arithmetic uses `bigint`.

The reward policy row is locked while evidence finalization calculates the daily cap, so
parallel proofs cannot independently consume the same remaining allowance.

`minimumQuality(values)` validates and returns the conservative minimum verifier quality.

### `domain/claims.ts`

Claim state machine:

```text
REQUESTED
 ├─ APPROVED → SUBMITTED → CONFIRMED
 ├─ REJECTED
 └─ CANCELLED

FAILED
 ├─ SUBMITTED
 └─ CANCELLED
```

Functions:

- `requestClaim`
- `approveClaim`
- `rejectClaim`
- `cancelClaim`
- `markClaimSubmitted`
- `confirmClaim`

The requester user row and membership are locked before the available balance is calculated.
This closes the concurrent double-claim race.

If a membership has a configured `reward_wallet`, the claim destination must match it.

### `domain/devices.ts`

`markStaleDevicesOffline()` changes ONLINE/WARNING nodes to OFFLINE after their configured
heartbeat timeout.

## Proof ingestion functions

Proof upload is idempotent by:

```text
device + sequence + SHA-256 digest
```

Retrying the same proof after a lost HTTP response returns the existing record.

A different payload using the same sequence is an integrity conflict.

Temporary configuration conditions return HTTP `425`:

- `REWARD_POLICY_NOT_READY`
- `REWARD_EPOCH_NOT_READY`
- `VERIFICATION_POLICY_NOT_READY`

The Raspberry Pi retains these proofs and retries with exponential backoff.

## Raspberry Pi functions

### `sampling.EnergyAccumulator`

Responsibilities:

- integrate W × seconds into Wh;
- never extrapolate energy through missing telemetry;
- preserve fractional Wh between proof windows;
- compute average W;
- track minimum reported quality;
- keep sample count.

### `retry.classify_http_failure`

Returns either:

```text
RETRY
```

or:

```text
DEAD
```

Continuity/source/physical-schema errors become dead letters because blindly skipping them
would invalidate every later digest-linked proof.

Temporary policy, server, authentication and rate-limit conditions remain queued.

### `queue.ProofQueue`

Durable SQLite state:

- `PENDING`
- `DEAD`
- attempts
- next retry timestamp
- HTTP status
- stable error code
- error detail

The queue is never automatically discarded because a server returns an arbitrary 4xx.

`latest_chain_state()` also repairs local sequence/digest state after a crash between queue
commit and state-file persistence.

## State persistence

`persist_state()` uses:

```text
write temporary file
    ↓
flush
    ↓
fsync
    ↓
atomic rename
```

This avoids partially written `state.json` after sudden power loss.


## Why a rejected proof does not break Solana

Transport continuity and settlement continuity are different domains.

```text
received:  10 → 11 → 12 → 13
                 X
verified:  10 →      12 → 13
```

The backend validates the complete digest-linked received chain.

The Solana program validates that verified sequence numbers move forward. Gaps are valid
because an intermediate physical proof may have been rejected by evidence policy.
