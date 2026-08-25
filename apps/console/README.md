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
