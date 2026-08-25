# MINER — PowerChain Proof-of-Energy Skill

## Purpose

Use this skill when an agent needs to inspect or reason about PowerChain renewable mining,
Proof of Energy, miner/device state, epochs, or settlement readiness.

PowerChain Miner is **not proof-of-work cryptocurrency mining**. Useful renewable-energy
measurements are signed at the edge, verified against policy/evidence, converted into bounded
reward accounting, and settled through the Solana program.

## Canonical flow

```text
physical meter / EMS
      ↓
edge measurement
      ↓
device signature
      ↓
Proof of Energy
      ↓
evidence quorum
      ↓
mining rules
      ↓
epoch + reward engine
      ↓
settlement intent
      ↓
wallet/program authorization
      ↓
Solana settlement
```

## Required rules

1. Never invent telemetry, meter readings, energy, proof digests, timestamps, balances, or
   transaction signatures.
2. Device signatures identify the enrolled signing key; they do not independently prove
   physical truth.
3. A proof must satisfy verification policy before reward accrual.
4. System mode must permit the requested operation.
5. Reward calculation must use integer base units.
6. Epoch identity is derived deterministically from observation time and configured
   `epochSeconds`.
7. AI can evaluate or recommend; it cannot silently sign wallets or bypass settlement policy.

## Protocol package

```ts
import {
  evaluateMiningProof,
  epochForTimestamp,
  systemStateForMode,
} from "@powerchain-protocol/miner";
```

## Safe response states

Prefer explicit states:

```text
PENDING_EVIDENCE
RULE_REJECTED
VERIFIED
REWARD_READY
SETTLEMENT_PENDING
SETTLED
```

Do not translate missing evidence into a successful state.
