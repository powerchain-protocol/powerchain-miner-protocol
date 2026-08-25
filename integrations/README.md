# PowerChain Integrations

**Canonical version:** `1.0.0`

Integration code is separated by trust boundary. External systems may provide data,
connectivity or settlement rails; none of them can silently become physical truth or protocol
authority.

## Physical / EMS

```text
ems/
services/device-agent/powerchain_miner/integrations/
```

Supported base adapters include explicit HTTP JSON and Modbus TCP mappings. MQTT remains
fail-closed until a TLS-capable production client is deliberately enabled.

## Solana

```text
packages/powerchain-protocol/miner/src/solana/
programs/miner/
programs/cct/
```

Supported ecosystem surfaces:

- SPL Token;
- Token-2022;
- Associated Token Accounts;
- Metaplex Token Metadata;
- Metaplex Core;
- Metaplex Bubblegum;
- Solana Pay;
- PowerChain Miner;
- PowerChain CCT.

## Solana DePIN

[`solana-depin/`](solana-depin/README.md) maps the official Solana Developers DePIN patterns
into PowerChain's device-identity/evidence architecture.

No nonexistent `@solana/depin` npm package is added to the dependency graph.

## Helium

[`helium/`](helium/README.md) provides:

- Helium Solana program/mint registry;
- Entity API integration;
- multi-gateway status and packet API integration;
- separate read/write gateway API credentials;
- Linux/RPM compatibility packaging guidance.

Helium connectivity never gives a gateway key PowerChain treasury or verifier authority.

## Application providers

- PostgreSQL;
- Next.js operator BFF;
- Helius RPC/API;
- Birdeye;
- Pyth;
- Agent Compute providers.

## Rule

An integration can normalize or attest its own data domain. It cannot directly mint MINER,
issue CCT, settle a wallet transfer, or override evidence/policy controls without the
corresponding authorized protocol path.
