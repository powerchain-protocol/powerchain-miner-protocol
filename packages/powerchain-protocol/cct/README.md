# @powerchain-protocol/cct

Canonical TypeScript contracts for **PowerChain Carbon Credit Token (CCT) v1.0.0**.

CCT represents verified carbon-credit units for issuance and retirement workflows. The actual
mint address is deployment-configured through `POWERCHAIN_CCT_MINT`; source code deliberately
does not invent a production mint.

## Unit

```text
1 CCT = 1 metric tonne CO2e
decimals = 6
1 CCT = 1,000,000 base units
```

The recommended deployment target is **Token-2022**. The CCT Anchor program accepts either
the canonical SPL Token program or Token-2022 through Anchor's token interface, but a single
registry deployment is permanently bound to the token program and mint supplied at
initialization.

Metadata can use Token-2022 metadata extensions or Metaplex Token Metadata. Metadata is
descriptive; verified project/batch evidence remains the issuance authority.

## Exports

```ts
import {
  CCT_CANONICAL_PROFILE,
  deriveCarbonProjectPda,
  carbonTonnesToBaseUnits,
} from "@powerchain-protocol/cct";
```

See [`../../../programs/cct/README.md`](../../../programs/cct/README.md).


## Build

```bash
corepack pnpm typecheck:cct
corepack pnpm build:cct
corepack pnpm pack:cct
```

The package never contains verifier, mint-authority, wallet, or upgrade-authority private
keys.
