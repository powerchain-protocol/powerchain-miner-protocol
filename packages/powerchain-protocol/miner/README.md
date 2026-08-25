# @powerchain-protocol/miner

**Canonical version:** `1.0.0`

Shared TypeScript protocol contracts for PowerChain Miner, DePIN, Solana token standards,
Helium connectivity, community energy, AI/MPC rules and wallet/payment boundaries.

This package is intentionally runtime-neutral: it does not load private keys, own PostgreSQL
state or execute privileged administrative workflows.

## Modules

```text
@powerchain-protocol/miner
@powerchain-protocol/miner/api/v1
@powerchain-protocol/miner/core
@powerchain-protocol/miner/solana
@powerchain-protocol/miner/helium
@powerchain-protocol/miner/depin
@powerchain-protocol/miner/community-energy
@powerchain-protocol/miner/iot
@powerchain-protocol/miner/nodes
@powerchain-protocol/miner/compute
@powerchain-protocol/miner/ai
@powerchain-protocol/miner/agents
@powerchain-protocol/miner/skills
```

## Owns

- canonical Miner PDA seeds and state-version constants;
- Proof-of-Energy types and digest validation;
- integer reward math and protocol reward ceilings;
- claim-id encoding and claim authorization bounds;
- Miner/Device/ClaimReceipt PDA derivation;
- canonical SPL Token, Token-2022, ATA and Metaplex program IDs;
- classic SPL/Token-2022 token classification;
- Metaplex Token Metadata PDA derivation;
- Helium Solana program IDs and HNT/MOBILE/IOT/DC mint registry;
- Helium Entity API and multi-gateway REST client contracts;
- Solana DePIN device-identity pattern contracts;
- community-energy listing/reservation contracts;
- system/epoch/mining-engine/rules contracts;
- bounded AI/MPC and agent capability rules;
- Solana Pay/pay.sh request preparation.

## Solana token support

```ts
import {
  SOLANA_PROGRAM_IDS,
  classifyTokenProgram,
  metaplexMetadataPda,
} from "@powerchain-protocol/miner/solana";
```

Supported token standards:

```text
SPL_TOKEN
TOKEN_2022
```

Supported metadata surfaces:

```text
TOKEN_2022_METADATA
METAPLEX_TOKEN_METADATA
METAPLEX_CORE
```

The Miner on-chain reward program remains Token-2022-only in v1.0.0. This package exposes
broader ecosystem support without mutating the already-persisted Miner program state schema.

## Helium

```ts
import {
  HELIUM_PROGRAM_IDS,
  HELIUM_TOKEN_MINTS,
  HeliumEntityApiClient,
  HeliumMultiGatewayClient,
} from "@powerchain-protocol/miner/helium";
```

The multi-gateway signing method requires an explicit write key. PowerChain browser routes do
not proxy it.

## Community energy

```ts
import {
  COMMUNITY_DEPIN_CAPABILITIES,
  reserveCommunityEnergy,
} from "@powerchain-protocol/miner/community-energy";
```

Reservations are economic intents only. Delivery remains meter/evidence driven.

## Does not own

- raw meter truth;
- authority keypair loading;
- wallet private keys;
- project/carbon methodology verification;
- backend RBAC or persistence;
- treasury execution policy;
- Helium gateway key custody.

## Canonical boundary

```text
physical / Helium / IoT sources
        ↓
services + backend verification
        ↓
@powerchain-protocol/miner
        ↓
programs/miner / programs/cct
        ↓
wallet/token settlement
```

For carbon-credit-specific contracts use
[`@powerchain-protocol/cct`](../cct/README.md).
