# @powerchain-protocol/miner

**Version:** `1.0.0`  
**Role:** canonical TypeScript protocol contract

`@powerchain-protocol/miner` is the shared protocol layer between the Anchor program, backend, SDKs, device/agent integrations, and application clients. It contains deterministic types, validation, math, identities, and protocol metadata—not privileged administration workflows.

## Core ownership

- canonical PDA seeds and derivation helpers;
- Token-2022 program identity;
- account/state version constants;
- Proof-of-Energy public types;
- deterministic integer reward math;
- claim-ID encoding and authorization bounds;
- protocol API namespace metadata;
- CORS/core/node/DePIN/Solana/Helius/IoT contracts;
- compute and AI/LLM/MPC protocol primitives;
- agent character and skill manifests.

## Module map

```text
@powerchain-protocol/miner
├── /api/v1
├── /cors
├── /core
├── /nodes
├── /depin
├── /solana
├── /helius
├── /iot/devices
├── /iot/hardwares
├── /iot/firmwares
├── /compute
├── /ai/llm
├── /ai/mpc
├── /agents
└── /skills
```

## Example

```ts
import {
  calculateProtocolRewardCeiling,
  deriveDevicePda,
  effectiveEnergyWh,
  uuidToClaimIdBytes,
} from "@powerchain-protocol/miner";
```

```ts
import {
  API_V1_PREFIX,
} from "@powerchain-protocol/miner/api/v1";

import {
  resolveLlmModel,
} from "@powerchain-protocol/miner/ai/llm";
```

## Boundary

```text
programs/miner                 deterministic on-chain settlement
        ↑
@powerchain-protocol/miner     canonical shared contracts
        ↑
@powerchain/miner-sdk          administrative RPC/Anchor workflows
apps/backend                   RBAC, evidence, economics, reconciliation
apps/console/mobile            operator/user surfaces
```

This package does **not** own private keys, authority keypair loading, raw physical evidence attestation, tenant RBAC, wallet signing, or provider billing credentials.

## AI/MPC boundary

`ai/mpc` means **Model Predictive Control**. It produces bounded plans/intents only; it does not directly actuate physical equipment. Execution remains subject to evidence, policy, approval, and authorized control-plane/device pathways.

## Canonical reference

On-chain instruction/account details: [`../../../programs/miner/README.md`](../../../programs/miner/README.md).

Agent characters and authority rules: [`CHARACTERS.md`](CHARACTERS.md).  
Skill registry: [`skills/SKILLS.md`](skills/SKILLS.md).
