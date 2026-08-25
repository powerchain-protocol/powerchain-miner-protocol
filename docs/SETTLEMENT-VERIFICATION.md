# Settlement Verification

PowerChain Miner v1.0 reconciles user-authorized claims executed by the Miner Anchor program.

See [Canonical MINER Claim Settlement — v1.0](CLAIM-SETTLEMENT-v1.md) for the complete
workflow.

## Canonical model

```text
Finance approval
      ↓
owner wallet authorization
      ↓
Anchor claim_rewards
      ↓
program treasury Token-2022 transfer
      ↓
ClaimReceipt PDA
      ↓
API reconciliation
```

A raw operator-provided Solana signature is never sufficient evidence of payment.

The API validates the configured program, ClaimReceipt, treasury vault, MINER mint,
destination token account, reward owner and exact base-unit amount.

`reward_claims.chain_signature` remains unique, so one Solana transaction cannot confirm two
claims.
