# @powerchain-protocol/miner

Canonical `1.0.0` TypeScript protocol contract for the PowerChain Renewable Miner program.

This package contains **protocol primitives**, not administration workflows.

## Owns

- canonical PDA seeds;
- Token-2022 program identity;
- account/state schema version constants;
- Proof-of-Energy public types;
- deterministic integer reward math;
- protocol reward-ceiling checks;
- proof-bound validation helpers;
- digest/claim-id conversion helpers;
- claim authorization bounds;
- Miner/Device/ClaimReceipt PDA derivation.

## Does not own

- RPC provider configuration;
- authority keypair loading;
- Anchor administrative commands;
- backend policy/RBAC;
- physical evidence attestation;
- wallet signing.

Those remain in `@powerchain/miner-sdk`, the backend, and the AgentOS execution layers.

## Usage

```ts
import {
  calculateProtocolRewardCeiling,
  deriveDevicePda,
  effectiveEnergyWh,
  uuidToClaimIdBytes,
} from "@powerchain-protocol/miner";
```

### Reward ceiling

```ts
const ceiling = calculateProtocolRewardCeiling({
  energyWh: 1_000n,
  qualityBps: 9_500,
  rewardPerWorkUnit: 100n,
  maxRewardPerProof: 100_000n,
});

// 95_000n
```

## Canonical boundary

```text
programs/miner                 on-chain authority
        ↑
@powerchain-protocol/miner     shared protocol contract
        ↑
@powerchain/miner-sdk          administrative Anchor/RPC SDK
apps/backend                   policy, evidence, rewards, claims
apps/console/mobile            user/operator surfaces
```

All public package metadata remains canonical `1.0.0`.
