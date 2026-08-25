# Control Plane Boundaries

## Authoritative service

`apps/backend` is the authoritative API for:

- device enrollment;
- heartbeat;
- Proof-of-Energy ingestion;
- evidence status;
- clients/RBAC;
- reward accounting;
- verifier queues;
- release manifests.

Raspberry Pi/Linux nodes should point directly to this service.

## Next.js

`apps/console` is the human UI/BFF layer.

Legacy device-facing Next.js `/api/v1/devices/*` and `/api/v1/proofs` preview handlers are
disabled unless:

```env
POWERCHAIN_ENABLE_PREVIEW_API=true
```

Keep this `false` in production to prevent a second ingestion/database path.

State-changing Next.js proxy/session routes use HTTP-only strict SameSite cookies and
same-origin validation.
