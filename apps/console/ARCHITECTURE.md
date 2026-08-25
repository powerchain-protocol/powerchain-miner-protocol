# PowerChain Console Architecture

**Canonical version:** `1.0.0`

The console uses explicit runtime and domain boundaries so client code cannot accidentally
pull server credentials or duplicated helper implementations into the browser bundle.

## Import layers

```text
app / components / hooks
          │
          ├── data/
          ├── context/
          ├── config/
          ├── types/
          ├── utils/
          │
          └── lib/
               ├── core/        universal pure helpers
               ├── chains/      Solana/Sui address + explorer logic
               ├── wallets/     browser wallet discovery
               ├── market-data/ server-only Birdeye/Pyth clients
               ├── client/      browser-safe barrel
               └── server/      server/BFF barrel
```

## Canonical imports

Prefer domain imports:

```ts
import {
  normalizeSolanaAddress,
} from "@/lib/chains/solana";

import {
  fetchPythPrices,
} from "@/lib/market-data/pyth";

import {
  detectEmbeddedWallets,
} from "@/lib/wallets";

import {
  safeAction,
} from "@/lib/core";
```

Legacy flat files such as `lib/solana.ts`, root `solana.ts`, or
`hooks/use-subsriptions.ts` are compatibility facades only. New application code must not
import them.

## Client/server rule

Client modules (`"use client"`) may not import:

```text
@/env/server
@/lib/server
@/lib/market-data
```

Market API keys, internal API credentials, and provider credentials remain server-side.

## Public barrels

```text
components/index.ts
components/ui/index.ts
data/index.ts
types/index.ts
utils/index.ts
hooks/index.ts
lib/index.ts
```

`lib/index.ts` intentionally excludes server-secret modules.

## Verification

```bash
corepack pnpm console:architecture
```

The same architecture check runs as part of the repository `check` and `quality` gates.
