# @powerchain/mobile

Expo SDK 57 / React Native 0.86 companion application.

Expo SDK 57 is used because it is the current stable Expo SDK line and targets React Native
0.86.

```bash
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev:mobile
```

Screens:

- Overview
- Miners
- Agent Compute
- Rewards
- More

The application consumes shared visual tokens from `@powerchain/design-system` and uses
`@powerchain/api-client` as its backend boundary.
