# PowerChain Renewable Miner OS v1.1.0

v1.1 keeps the canonical v1 protocol/economic architecture and upgrades the product into a
four-app monorepo.

## New application topology

```text
apps/backend
apps/console
apps/frontend
apps/mobile
```

Legacy folder names `apps/miner-api` and `apps/miner-web` are removed.

## Frontend

`apps/frontend` is a separate Next.js 16.3 public product website.

It contains split sections for:

- hero/product preview;
- platform features;
- Proof-of-Energy flow;
- architecture;
- Expo mobile product;
- security;
- footer/header.

The website includes an installable PWA surface through:

```text
components/PWA.tsx
app/manifest.ts
public/sw.js
```

The service worker never caches `/api/*`.

## Mobile

`apps/mobile` uses Expo SDK 57 and React Native 0.86.

Initial application surfaces:

- Overview;
- Miners;
- Rewards;
- More/System.

The mobile application is explicitly an operations client and does not hold treasury,
verifier or program-upgrade authority.

## Shared packages

### `@powerchain/design-system`

One token source for web/native:

```text
white
light gray
dark green
black / charcoal
```

### `@powerchain/api-client`

Runtime-neutral `/api/v1` HTTP boundary.

## Backend

The Fastify control plane is now `apps/backend`.

A canonical API namespace module lives at:

```text
apps/backend/src/api/v1/
```

Existing public application endpoints remain under `/api/v1`.

## Console

The authenticated Next.js application is now `apps/console` and consumes the shared visual
tokens.

## Documentation

New:

- `docs/DESIGN-GUIDE.md`
- `docs/MONOREPO.md`
- `apps/frontend/README.md`
- `apps/mobile/README.md`
- `apps/backend/README.md`

## Design rules

- light theme is default;
- white primary cards;
- light-gray canvas;
- dark-green primary actions;
- black/charcoal typography;
- no purple;
- no neon;
- no generic rainbow Web3 visual language;
- status is never communicated by color alone;
- mobile converts tables to stacked records rather than creating horizontal overflow.
