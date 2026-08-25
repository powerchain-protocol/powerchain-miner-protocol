# Key and Secret Management

## Never commit

- npm access tokens;
- wallet private keys or seed phrases;
- Solana program keypairs;
- treasury or verifier signing keys;
- JWT/session secrets;
- compute API keys;
- Helius/provider API secrets;
- card credentials or payment-session secrets.

## Storage boundaries

| Secret | Preferred storage |
|---|---|
| Agent/user wallet keys | Wallet / OS secure store / hardware signer |
| pay.sh account keys | OS secure store selected by `pay setup` |
| Program deploy authority | Hardware/offline signer or protected CI environment |
| Verifier key | Dedicated secret manager / isolated worker |
| npm publishing | Trusted Publishing OIDC; no persistent token |
| Local development service secrets | untracked `.env` files |

## Repository checks

```bash
corepack pnpm secrets:check
```

The checker fails on common npm/GitHub token and PEM private-key patterns.

## Rotation

If a secret is exposed:

1. revoke/disable it at the provider;
2. create a replacement with minimum required scope;
3. update the secret manager, not source control;
4. invalidate sessions/credentials derived from it when applicable;
5. review logs and audit history for unexpected use.


## CCT and Helium key separation

The expanded DePIN stack introduces additional credential classes that must remain distinct:

| Credential | Purpose | May sign wallet transfers? |
|---|---|---|
| PowerChain device Ed25519 key | physical node evidence | no |
| Evidence verifier Ed25519 key | evidence attestation | no |
| Miner Solana verifier key | `submit_verified_proof` | only its allowed program instruction |
| CCT verifier key | `issue_verified_batch` | only its allowed CCT instruction |
| Helium gateway key | Helium gateway identity/packet signatures | no PowerChain wallet authority |
| Helium multi-gateway read key | status/packet API | no |
| Helium multi-gateway write key | gateway signing API | no PowerChain wallet authority |
| treasury/reward-owner wallet | token settlement | yes, according to wallet policy |
| program upgrade authority | program deployment governance | program upgrades only |

Do not reuse a gateway key as a CCT/Miner verifier or treasury wallet merely to simplify
operations.

Helium multi-gateway read/write API keys are host secrets and must not be exposed as
`NEXT_PUBLIC_*` variables.
