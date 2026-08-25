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
pnpm secrets:check
```

The checker fails on common npm/GitHub token and PEM private-key patterns.

## Rotation

If a secret is exposed:

1. revoke/disable it at the provider;
2. create a replacement with minimum required scope;
3. update the secret manager, not source control;
4. invalidate sessions/credentials derived from it when applicable;
5. review logs and audit history for unexpected use.
