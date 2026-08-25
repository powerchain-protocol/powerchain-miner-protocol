# PowerChain Mining Engine

**Canonical product version:** `1.0.0`

PowerChain mining is renewable **Proof of Energy** accounting, not proof-of-work hashing.

## Layers

```text
SYSTEM MODE
    ↓
PHYSICAL PROOF
    ↓
EVIDENCE QUORUM
    ↓
MINING RULES
    ↓
EPOCH RESOLUTION
    ↓
REWARD ENGINE
    ↓
SETTLEMENT POLICY
    ↓
SOLANA PROGRAM
```

### System

`@powerchain-protocol/miner/system` defines:

```text
LIVE
READ_ONLY
SIMULATION
MAINTENANCE
```

Only `LIVE` permits reward accrual and settlement. Simulation can evaluate proof inputs but
must not produce economic settlement.

### Epoch

`@powerchain-protocol/miner/epoch` derives epochs from Unix observation time:

```text
epochId = observedAt / epochSeconds
```

The on-chain `ProofAccepted` event uses the same observation-time basis. Delayed verifier or
Solana submission time therefore cannot move physical energy into a later protocol epoch.

### Rules

`@powerchain-protocol/miner/rules` evaluates:

- positive sequence;
- positive energy;
- per-proof energy ceiling;
- minimum verified quality;
- minimum sample count;
- future clock skew;
- proof age;
- observation age.

Rules return explicit violations instead of silently modifying proof data.

### Reward engine

`@powerchain-protocol/miner/mining-engine` composes system mode, epoch resolution, rules, and
the canonical bigint reward engine.

The engine never signs transactions and never fabricates evidence.

```ts
import {
  evaluateMiningProof,
  systemStateForMode,
} from "@powerchain-protocol/miner";
```

## Agent rules

All miner agents inherit the mandatory rules in:

```text
@powerchain-protocol/miner/agents
```

The rules prohibit fabricated physical truth, private-key custody, silent settlement, policy
bypass, unbounded autonomous compute/payment spend, and execution without retained evidence.
