# @powerchain/mobile

**Version:** `1.0.0`  
**Runtime:** Expo SDK 57 · React Native 0.86

PowerChain mobile companion for operational visibility and approved user workflows.

## Primary surfaces

```text
Overview
Miners
Agent Compute
Rewards
More
```

The mobile app is an API client. It must not hold protocol-upgrade authority, treasury authority, verifier private keys, or other backend service secrets.

## Development

```bash
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev:mobile
```

The app consumes shared design tokens from `@powerchain/design-system` and the canonical backend boundary through shared clients.

See [`../../docs/DESIGN-GUIDE.md`](../../docs/DESIGN-GUIDE.md).
