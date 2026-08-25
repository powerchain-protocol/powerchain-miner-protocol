# Observability

Version 0.5 adds:

- `GET /api/v1/health`
- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `GET /metrics`

Prometheus metrics include HTTP request totals/latency, accepted Proof-of-Energy count,
accepted renewable Wh, verifier queue depth and Node.js process metrics.

Every API response also carries `x-request-id` and `x-correlation-id`.
Set `METRICS_TOKEN` to protect the metrics endpoint.


## v0.8 queue gauges

Additional Prometheus gauges:

- `powerchain_miner_evidence_queue`
- `powerchain_miner_unbound_settlement_proofs`
- `powerchain_miner_dead_letter_devices`

These distinguish evidence backlog from blockchain-binding backlog and node-local integrity
failures.

## Settlement and approval controls

Canonical metrics include:

```text
powerchain_miner_settlement_active_leases
powerchain_miner_settlement_intents{state=...}
powerchain_miner_settlement_state_recoveries_total
powerchain_miner_pending_claim_approvals
```

Use `GET /api/v1/health/chain` for cached on-chain deployment health. It is intentionally separate from the fast readiness probe.
