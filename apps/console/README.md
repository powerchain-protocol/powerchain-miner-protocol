# PowerChain Console

Authenticated desktop operations UI for **PowerChain Renewable Miner OS**.

**Canonical version:** `1.0.0`  
**Framework:** Next.js 16.3.2 · React 19.2.8 · TypeScript 5.9.3  
**UI:** Tailwind CSS 4.3.3 · shadcn-style components · Radix Primitives · React Icons

## Design system

The console is light-first and uses the canonical PowerChain palette:

```text
white        primary surfaces
light gray   canvas / muted surfaces
dark green   primary actions / positive state
black        typography / high-severity neutral state
```

Theme variables live in:

```text
styles/themes.css
styles/wallet-connect.css
styles/desktop.css
```

Tailwind v4 consumes those CSS variables, while existing dense operational CSS remains
compatible through legacy variable aliases in `app/globals.css`.

## Structure

```text
app/                    Next.js App Router pages
components/common/      reusable desktop shell components
components/modals/      Radix dialog workflows
components/ui/          shadcn-style primitives
config/                 application/navigation configuration
constants/              routes, network, session and UI constants
context/                application + wallet providers
env/                    client/server environment boundaries
events.ts               typed application event bus
types/events.ts         application event contracts
styles/                  themes, wallet and desktop shell styles
proxy.ts                session route protection
vercel.json             Vercel monorepo build configuration
```

## UI primitives

The package includes reusable Button, Badge, Card, Dialog, Dropdown Menu and Tooltip
primitives. Dialog/dropdown/tooltip behavior is built on Radix rather than hand-rolled focus
management.

## Wallet boundary

`WalletProvider` detects Phantom, Backpack, Solflare or a compatible injected Solana
provider. It requests only user connection/signing capability; private keys are never passed
to the console or backend.

## Development

From the repository root:

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate
pnpm install
pnpm dev:console
```

Console:

```text
http://localhost:3000
```

## Build

```bash
pnpm typecheck:console
pnpm build:console
```

The Vercel configuration is intentionally scoped to the console workspace and never embeds
runtime secrets.


## Application architecture

The desktop console is organized by runtime boundary and domain instead of by flat helper
files:

```text
app/                      Next.js routes and server components
components/
  common/                 desktop shell and reusable operational presentation
  modals/                 Radix-backed workflows
  ui/                     shadcn-style primitives
config/                   application/navigation configuration
constants/                routes, sessions, networks, tiers and UI constants
context/                  app/wallet providers
data/                     fetch, normalization and derived application data
env/                      client/server environment parsing
events.ts                 typed event bus
hooks/                    browser orchestration hooks
lib/
  core/                   pure universal helpers and safe actions
  chains/                 Solana/Sui addresses, explorers and transactions
  wallets/                browser wallet discovery
  market-data/            server-only Birdeye/Pyth integrations
  client/                 browser-safe barrel
  server/                 BFF/server-only barrel
styles/                   theme, desktop and wallet styles
types/                    application contracts
utils/                    formatting/token/currency/payment helpers
```

### Runtime boundaries

Client modules must not import:

```text
@/env/server
@/lib/server
@/lib/market-data
```

Server provider keys and internal credentials therefore cannot enter client bundles through a
shared barrel.

Canonical domain imports:

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

Earlier flat files such as `lib/solana.ts`, root `solana.ts`, and the misspelled
`use-subsriptions.ts`/`subsribe.ts` paths are retained only as compatibility facades. New
code is prevented from importing them by the architecture checker.

Detailed rules:

- [Console Architecture](ARCHITECTURE.md)

Validate:

```bash
corepack pnpm console:architecture
```

## Application dependencies

Direct integration packages are pinned explicitly:

```text
axios
bs58
lodash
zod
```

Browser WebSockets use the native `WebSocket` API. Node-only `ws` belongs to backend
realtime infrastructure and is not bundled into the browser application.

Birdeye and Pyth credentials are server-only values. Do not prefix them with
`NEXT_PUBLIC_`.

## Development

From the repository root:

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate
corepack pnpm install
corepack pnpm dev:console
```

Quality gates:

```bash
corepack pnpm console:architecture
corepack pnpm typecheck:console
corepack pnpm build:console
```

The Vercel configuration is scoped to the console workspace and never embeds runtime secrets.

## Application architecture

The desktop console is organized by runtime boundary and domain instead of by flat helper
files:

```text
app/                      Next.js routes and server components
components/
  common/                 desktop shell and reusable operational presentation
  modals/                 Radix-backed workflows
  ui/                     shadcn-style primitives
config/                   application/navigation configuration
constants/                routes, sessions, networks, tiers and UI constants
context/                  app/wallet providers
data/                     fetch, normalization and derived application data
env/                      client/server environment parsing
events.ts                 typed event bus
hooks/                    browser orchestration hooks
lib/
  core/                   pure universal helpers and safe actions
  chains/                 Solana/Sui addresses, explorers and transactions
  wallets/                browser wallet discovery
  market-data/            server-only Birdeye/Pyth integrations
  client/                 browser-safe barrel
  server/                 BFF/server-only barrel
styles/                   theme, desktop and wallet styles
types/                    application contracts
utils/                    formatting/token/currency/payment helpers
```

### Runtime boundaries

Client modules must not import:

```text
@/env/server
@/lib/server
@/lib/market-data
```

Server provider keys and internal credentials therefore cannot enter client bundles through a
shared barrel.

Canonical domain imports:

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

Earlier flat files such as `lib/solana.ts`, root `solana.ts`, and the misspelled
`use-subsriptions.ts` / `subsribe.ts` paths are retained only as compatibility facades. New
code is prevented from importing them by the architecture checker.

Detailed rules:

- [Console Architecture](ARCHITECTURE.md)

Validate:

```bash
corepack pnpm console:architecture
```

## Application dependencies

Direct integration packages are pinned explicitly:

```text
axios
bs58
lodash
zod
```

Browser WebSockets use the native `WebSocket` API. Node-only `ws` belongs to backend
realtime infrastructure and is not bundled into the browser application.

Birdeye and Pyth credentials are server-only values. Do not prefix them with
`NEXT_PUBLIC_`.

## Development

From the repository root:

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate
corepack pnpm install
corepack pnpm dev:console
```

Quality gates:

```bash
corepack pnpm console:architecture
corepack pnpm typecheck:console
corepack pnpm build:console
```

The Vercel configuration is scoped to the console workspace and never embeds runtime secrets.
