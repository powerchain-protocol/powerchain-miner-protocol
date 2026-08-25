# @powerchain/frontend

**Version:** `1.0.0`  
**Framework:** Next.js 16 · React 19

Public marketing website and installable PWA for PowerChain Renewable Miner OS and Agent Compute.

## Responsibilities

- product positioning and architecture explanation;
- Proof-of-Energy, community DePIN, CCT and Agent Compute feature surfaces;
- security/trust-boundary communication;
- Solana/Helium/IoT ecosystem and community-energy positioning;
- documentation and console entry points;
- installable PWA shell.

It is intentionally separate from the authenticated operator console and must not become a second control plane.

## Development

```bash
corepack pnpm dev:frontend
```

Default URL:

```text
http://localhost:3002
```

## PWA rules

The public service worker does not cache `/api/*` responses. Navigation is network-first and only safe same-origin static assets are cached.

Design system: [`../../docs/DESIGN-GUIDE.md`](../../docs/DESIGN-GUIDE.md).
