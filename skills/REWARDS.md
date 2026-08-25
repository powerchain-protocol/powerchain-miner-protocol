# REWARDS — PowerChain Miner Reward Skill

## Purpose

Use this skill for reward calculation, epoch accounting, claim preparation, approval quorum,
and settlement review.

## Canonical reward order

```text
energy Wh
  ↓
verified quality bps
  ↓
quality-adjusted Wh
  ↓
tenant base-units-per-Wh
  ↓
per-proof cap
  ↓
daily cap
  ↓
protocol on-chain ceiling
  ↓
emission cap
```

Every quantity representing tokens must use integer base units.

## Claim boundary

A computed reward is not a transfer authorization.

```text
ACCRUAL
  ↓
claim request
  ↓
approval quorum
  ↓
prepared ClaimReceipt instruction
  ↓
reward-owner wallet signature
  ↓
Token-2022 transfer
  ↓
cryptographic reconciliation
```

High-value claims may require role-distinct Finance + Client Admin approval. A requester does
not approve their own claim.

## Package functions

```ts
import {
  calculateReward,
  calculateProtocolRewardCeiling,
  assertClaimAmount,
} from "@powerchain-protocol/miner";
```

## Never

- convert floating-point UI amounts directly into settlement instructions;
- exceed configured proof/daily/protocol/emission caps;
- claim a transaction is settled before chain reconciliation;
- use SuperAdmin as an implicit substitute for client approval roles.
