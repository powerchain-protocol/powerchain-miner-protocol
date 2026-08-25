# PowerChain Renewable Miner — Backend, Clients, RBAC & Rewards

## Tenant model

```text
PLATFORM
  |
  +-- SUPERADMIN
  |
  +-- CLIENT / ORGANIZATION
        |
        +-- CLIENT_ADMIN
        +-- OPERATOR
        +-- FINANCE
        +-- VERIFIER
        +-- VIEWER
        |
        +-- USERS / MEMBERSHIPS
        +-- DEVICES
        +-- PROOFS
        +-- REWARD POLICIES
        +-- REWARD EPOCHS
        +-- REWARD LEDGER
        +-- REWARD CLAIMS
        +-- TREASURY SNAPSHOTS
```

`SUPERADMIN` is intentionally not a membership role. It is a platform-level user attribute.
Every other role is scoped through `client_memberships`.

## Separation of duties

- **CLIENT_ADMIN**: members, devices, reward policy configuration.
- **OPERATOR**: hardware/node operations and proof visibility.
- **VERIFIER**: evidence verification; cannot approve payouts.
- **FINANCE**: reward epochs and claim approval; cannot operate device identity.
- **VIEWER**: read-only.
- **SUPERADMIN**: platform clients, global controls, final chain settlement/reconciliation.

The API prevents a non-SuperAdmin requester from approving their own claim.

## Reward state

```text
VERIFIED PROOF
      |
      v
ACCRUAL LEDGER ENTRY
      |
      v
REWARD EPOCH
 OPEN -> CALCULATING -> READY -> CLOSED
      |
      v
CLAIM
 REQUESTED
      |
      +-- REJECTED -> CLAIM_RELEASE
      |
      v
 APPROVED
      |
      v
 SUBMITTED
      |
      v
 CONFIRMED -> SETTLEMENT
```

Ledger entries are append-only. Claims create a negative `CLAIM_HOLD` balance effect so the
same accrued balance cannot be claimed twice.

## Backend

Standalone Fastify/PostgreSQL service:

```text
apps/backend/
├── migrations/
├── scripts/
└── src/
    ├── server.ts
    ├── db.ts
    ├── rbac.ts
    ├── audit.ts
    ├── password.ts
    ├── schema.ts
    └── types.ts
```

## Bootstrap

```bash
cp apps/backend/.env.example apps/backend/.env
docker compose up -d postgres

corepack pnpm install
corepack pnpm db:migrate
corepack pnpm db:seed

corepack pnpm dev:api
corepack pnpm dev
```

Backend: `http://localhost:3100`
Web: `http://localhost:3000`

## Mainnet production requirements

- external identity provider or password reset/invite flow before enabling invited users;
- rate limiting and brute-force controls on login;
- CSRF defense for state-changing browser requests;
- managed PostgreSQL backups/PITR;
- row/tenant isolation tests;
- independent RBAC tests;
- verifier and treasury signers outside the web/API process;
- final claim settlement from a dedicated treasury worker/multisig;
- audit export and immutable retention;
- transaction reconciliation before `CONFIRMED`.


## Device-to-reward wiring

Each client can create a scoped device API key:

```text
CLIENT_ADMIN
    |
    v
POST /clients/:clientId/device-keys
    |
    v
pcmk_...  (shown once)
    |
    v
Raspberry Pi enrollment
```

After enrollment, the API key is no longer used for proof authenticity. The node signs each
heartbeat/proof using its local Ed25519 device key.

Accepted proof path:

```text
signed device proof
      |
      +-- device enabled?
      +-- signature valid?
      +-- monotonic sequence?
      +-- renewable type matches?
      +-- active reward policy?
      +-- open epoch?
      +-- per-proof cap?
      +-- daily policy cap?
      |
      v
proofs
      |
      +--> device totals
      +--> epoch totals
      `--> reward_ledger / ACCRUAL
```

This makes reward accrual a backend accounting result of verified energy evidence. The UI
does not determine reward balances.


## Numeric and tenant safety

All API-facing MINER base-unit amounts are decimal strings. PostgreSQL stores them as
`numeric(30,0)`. This avoids IEEE-754 precision loss when reward balances exceed JavaScript's
safe integer range.

After enrollment the Pi persists the server-returned `client_id` and includes both:

```text
x-powerchain-client: <uuid>
x-powerchain-device: <external-device-id>
```

on heartbeat/proof requests. The backend scopes the device lookup by both values before
verifying the Ed25519 signature. This prevents cross-tenant collision when two clients use
the same local node label or identifier.


## Management UI

The Next.js console is now wired to the backend for:

- `/clients` — tenant list and SuperAdmin client creation;
- `/clients/:clientId` — members, roles, device fleet and one-time Raspberry Pi enrollment keys;
- `/rewards` — summaries, policy creation, epoch creation and Finance/SuperAdmin claim approval;
- `/roles` — permission matrix;
- `/superadmin` — platform-wide health and settlement boundary.

The browser never receives the JWT directly after login. Next.js stores it in an HTTP-only
session cookie and server-side routes/actions call the backend.


## Reward-quality authority

Node-reported quality is stored as diagnostic telemetry. Reward calculation uses the
client-controlled reward policy's verified `quality_bps`, not the node-provided value.
This is a deliberate anti-self-reward control.
