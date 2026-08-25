# PowerChain Agent Compute

**Version:** 1.2.0  
**Public base URL:** `https://compute.powerchain.energy/v1`

Agent Compute lets a PowerChain AgentOS agent fund and consume hosted compute using the same
agent identity and wallet used by the rest of the platform.

It deliberately separates:

```text
agent identity
wallet funding
compute credit
API credential
model request
usage settlement
```

A compute API key can spend **compute credit**. It cannot sign wallet transfers, access the
agent's private key, or become treasury/program authority.

---

## 1. Architecture

```text
PowerChain Agent
├── identity
├── owner
├── wallet
└── compute account
      │
      ├── API keys
      ├── balance
      ├── reservations
      ├── usage ledger
      └── auto-top-up policy
             │
             ▼
https://compute.powerchain.energy/v1
             │
       request preauthorization
             │
             ▼
     configured compute upstream
             │
             ▼
        token usage receipt
             │
             ▼
      append-only usage debit
```

Control plane:

```text
apps/backend
/api/v1/agents/*
/api/v1/compute/*
```

Data plane:

```text
apps/compute
/v1/models
/v1/account
/v1/chat/completions
/v1/responses
/v1/topups/:intentId/confirm
```

---

## 2. Compute credit

One displayed compute credit equals:

```text
1,000,000 compute microunits
```

Compute credit is an internal usage-accounting unit.

Its relationship to a wallet funding asset is explicitly configured through:

```text
compute_funding_assets.credit_microunits_per_base_unit
```

The protocol does not silently assume a fiat exchange rate.

Example for a deliberate 1:1 USDC configuration:

```text
USDC decimals = 6
1 USDC base unit = 1 compute microunit
1 USDC = 1,000,000 compute microunits
```

That mapping must be configured by the platform operator.

---

## 3. API keys

Generate from the Agent Compute console.

Secrets use:

```text
pc_compute_<random secret>
```

The plaintext is returned once.

PostgreSQL stores only:

```text
key prefix
SHA-256 key hash
status
expiry
last used time
```

The public compute gateway hashes the presented key before sending an authorization request
to the control plane. The control plane does not need the raw secret.

---

## 4. Endpoint access

### Models

```http
GET /v1/models
```

### Account

```http
GET /v1/account
Authorization: Bearer pc_compute_...
```

Returns:

- agent identity;
- wallet identity;
- available credit;
- in-flight reservation;
- auto-top-up policy.

### Chat Completions

```http
POST /v1/chat/completions
Authorization: Bearer pc_compute_...
Content-Type: application/json
```

Example:

```json
{
  "model": "reasoning-large",
  "messages": [
    {
      "role": "user",
      "content": "Summarize today's site anomalies."
    }
  ],
  "max_completion_tokens": 1200
}
```

### Responses

```http
POST /v1/responses
Authorization: Bearer pc_compute_...
Content-Type: application/json
```

The public model name is mapped to an operator-configured upstream model.

Upstream provider credentials never reach the agent.

Agent Console-style runtimes can load their provisioned credentials directly:

```ts
import {
  agentComputeFromEnv,
} from "@powerchain/agent-compute/runtime";

const compute = agentComputeFromEnv();
```

Expected runtime secrets:

```text
POWERCHAIN_COMPUTE_API_KEY=pc_compute_...
POWERCHAIN_COMPUTE_BASE_URL=https://compute.powerchain.energy/v1
```

External runtimes can also construct the bundled client explicitly:

```ts
import {
  createAgentComputeClient,
} from "@powerchain/agent-compute/client";

const compute = createAgentComputeClient({
  apiKey: process.env.POWERCHAIN_COMPUTE_API_KEY!,
});

const response = await compute.chatCompletions({
  model: "reasoning-large",
  messages: [
    { role: "user", content: "Inspect the latest energy anomaly." }
  ],
});
```

---

## 5. Usage authorization

Before a provider request executes:

```text
API key
  ↓
agent active?
  ↓
compute account active?
  ↓
model enabled?
  ↓
estimate conservative maximum request cost
  ↓
available credit >= reservation?
  ↓
AUTHORIZED
```

Input reservation intentionally uses a conservative UTF-8-byte estimate rather than a
client-supplied token estimate.

Output reservation uses the requested output limit or the configured model maximum.

This biases toward over-reserving credit rather than allowing an agent to spend beyond its
balance.

Request IDs are single-use. Agent Compute does not re-execute a model request for a repeated
`x-request-id`, because the gateway does not persist model response bodies for replay. A
duplicate ID returns a conflict instead of creating unbilled duplicate inference.

---

## 6. Usage settlement

After the upstream returns a successful non-streaming response:

```text
input tokens
cached input tokens
output tokens
provider request ID
```

are reconciled against the configured model rates.

Actual cost:

```text
uncached input cost
+ cached input cost
+ output cost
```

becomes one append-only:

```text
USAGE_DEBIT
```

entry.

The original authorization becomes:

```text
SETTLED
```

If the provider fails before producing compute, the reservation becomes:

```text
RELEASED
```

---

## 7. Streaming policy

Canonical v1.0.0 intentionally rejects streaming requests.

Reason:

A production streaming gateway must durably record final usage even if:

- the client disconnects;
- the compute gateway restarts;
- the control-plane network is temporarily unavailable after output has already streamed.

Until that durable streaming reconciliation path exists, streaming fails closed rather than
creating unbilled compute.

---

## 8. Auto-top up

Configuration:

```text
autoTopupEnabled
preferredChain
preferredAssetSymbol
topupAmount
lowBalanceThreshold
maxAutoTopupPerDay
```

When the remaining balance falls below the threshold, the control plane may create:

```text
AUTO_THRESHOLD top-up intent
```

When a request cannot be authorized because credit is insufficient:

```text
INSUFFICIENT_BALANCE top-up intent
```

The compute response exposes the intent through both JSON and:

```text
x-powerchain-auto-topup-intent
```

The intent includes the payment quote:

```text
chain
asset symbol
asset identifier / mint
treasury destination
asset decimals
required base units
expiry
```

---

## 9. Wallet execution

The backend does not move wallet funds.

AgentOS uses its own wallet authorization policy to decide whether to sign the quoted
payment.

For Solana:

```ts
import {
  buildSolanaComputeTopupTransaction,
  confirmComputeTopup,
} from "@powerchain/agent-compute/solana";
```

Flow:

```text
top-up intent
   ↓
construct exact token transfer
   ↓
AgentOS wallet policy
   ↓
agent wallet signs
   ↓
Solana confirms
   ↓
POST /v1/topups/:intentId/confirm
   ↓
backend independently verifies transfer
   ↓
TOPUP_CREDIT
```

The helper supports both legacy SPL Token and Token-2022 mints by reading the funding mint's
actual on-chain owner.

---

## 10. Solana top-up verification

The backend independently requires:

- transaction exists;
- transaction succeeded;
- source token account belongs to the configured agent wallet;
- funding mint matches the configured funding asset;
- destination is the configured compute treasury token account;
- amount equals the quoted base-unit amount.

Only then is compute credit issued.

The transaction signature is unique per top-up intent.

---

## 11. Sui

The database and policy model reserve `sui` as a preferred funding chain.

Canonical v1.0.0 does **not** implement Sui payment verification.

A Sui top-up confirmation fails explicitly rather than marking unverified wallet funding as
credit.

---

## 12. Auto-top-up safety

Autonomous top-up is bounded by:

```text
top-up amount
low balance threshold
daily auto-top-up cap
top-up intent expiry
exact funding asset
exact treasury destination
```

The compute API key cannot perform the wallet signature.

The AgentOS wallet policy remains the final authorization boundary.

A daily cap of `0` disables autonomous top-up. It never means unlimited wallet spending.

---

## 13. Model pricing

No provider pricing is compiled into the application.

SuperAdmin configures:

```text
public model
upstream model
input microunits / 1K tokens
cached input microunits / 1K tokens
output microunits / 1K tokens
maximum output tokens
```

This allows hosted providers, internal GPU clusters, or external OpenAI-compatible services
to share the same Agent Compute accounting layer.

---

## 14. Local adapters

```text
apps/compute/adapters/
├── codex-local-proxy.mjs
└── claude-code-local-adapter.mjs
```

Codex/OpenAI-style clients can use the localhost OpenAI-compatible proxy.

The Claude Code adapter converts basic Anthropic text-message requests to Agent Compute Chat
Completions.

Advanced streaming/tool-block translation is intentionally not faked in canonical v1.0.0.

---

## 15. Security boundaries

```text
Compute API key
  CAN:
    authorize model usage
    inspect its own compute account
    reconcile its own top-up payment

  CANNOT:
    sign wallet transactions
    change funding policy
    mint tokens
    access provider credentials
    access another agent
    approve reward claims
    administer models
```

Client Admin / Finance controls funding policy.

SuperAdmin controls model rates and funding-asset configuration.

---

## 16. Operational metrics to add next

Recommended next telemetry:

- authorization latency;
- upstream latency;
- provider error rate;
- reserved credit;
- settled spend;
- 402 insufficient-balance rate;
- auto-top-up intent rate;
- top-up confirmation latency;
- stuck authorization count;
- per-model token/cost aggregates.
