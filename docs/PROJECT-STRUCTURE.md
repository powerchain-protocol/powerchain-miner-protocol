# PowerChain Project Structure

**Canonical product version:** `1.0.0`

This document defines where new code belongs. It is intentionally stricter than a directory
listing: each top-level area has an ownership boundary.

## Top-level ownership

```text
apps/           deployable user/service applications
packages/       reusable TypeScript libraries and protocol contracts
programs/       on-chain programs
services/       long-running workers and edge/device processes
skills/         reusable agent skills
utilities/      local developer/runtime adapters
scripts/        repository automation and release gates
config/         checked-in non-secret deployment/runtime templates
docker/         container build and compose support
docs/           current documentation + isolated history
tests/          repository-level regression tests
```

## Applications

```text
apps/backend
  Fastify/PostgreSQL control plane.
  Owns /api/v1, RBAC, ledger/reward state and reconciliation.

apps/console
  Authenticated Next.js operator workspace.
  Does not own protocol economics or private keys.

apps/compute
  Agent Compute data plane.
  Does not mutate PostgreSQL directly.

apps/frontend
  Public marketing/PWA surface.
  No authenticated operational authority.

apps/mobile
  Expo/React Native companion.
  No treasury/verifier/program authority custody.
```

Applications must not import another application.

## Packages

```text
packages/powerchain-protocol/miner
  Canonical Miner protocol contracts, rules, epochs, mining engine, PDAs and payments.

packages/miner-sdk
  Administration/deployment SDK built on the canonical protocol package.

packages/agent-compute
  Runtime-neutral Agent Compute client and wallet-funding primitives.

packages/api-client
  Runtime-neutral /api/v1 HTTP client.

packages/design-system
  Shared design tokens and web/native styling primitives.
```

Packages must not import deployable applications.

## Console internal organization

```text
apps/console/
├── app/
├── components/
├── config/
├── constants/
├── context/
├── data/
├── env/
├── hooks/
├── lib/
│   ├── core/
│   ├── chains/
│   ├── wallets/
│   ├── market-data/
│   ├── client/
│   └── server/
├── styles/
├── types/
└── utils/
```

Flat compatibility files remain only for previous generated imports. New code uses domain
paths and is verified by:

```bash
corepack pnpm console:architecture
```

## Documentation

Current documentation stays in `docs/`.

Historical implementation material stays under:

```text
docs/history/migrations/
docs/history/working-iterations/
```

Do not add superseded `RELEASE-NOTES-v1.x.md` files back to the current documentation root.

## Dependency direction

```text
physical/device services
        ↓
backend control plane
        ↓
protocol package / Solana program
        ↓
API clients
        ↓
console / mobile

design-system ─────────────► frontend / console / mobile
agent-compute ─────────────► compute runtimes
miner-sdk ─────────────────► deployment/admin tools
```

## Naming

Prefer:

```text
use-subscriptions.ts
types/subscribe.ts
lib/chains/solana.ts
lib/market-data/pyth.ts
```

Deprecated typo/flat compatibility files may remain but may not be imported by new internal
code.

## Verification

```bash
corepack pnpm repo:organization
corepack pnpm console:architecture
corepack pnpm docs:check
```
