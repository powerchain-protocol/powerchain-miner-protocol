# PowerChain Carbon Credit Token (CCT)

**Version:** `1.0.0`

CCT is PowerChain's verified carbon-credit tokenization boundary.

```text
verified project + methodology evidence
        ↓
CCT verifier
        ↓
CarbonBatch
        ↓
CCT mint
        ↓
wallet / marketplace
        ↓
retirement request
        ↓
token burn
        ↓
RetirementReceipt
```

## Unit

```text
1 CCT = 1 metric tonne CO2e
decimals = 6
```

CCT's actual mint is not hardcoded until deployment. Use:

```env
POWERCHAIN_CCT_MINT=
```

## Token compatibility

The CCT registry can bind to either:

- classic SPL Token;
- Token-2022.

Token-2022 is recommended for new deployments. A registry cannot switch token programs after
initialization.

Token-2022 metadata or Metaplex Token Metadata can describe the asset; project/batch
verification remains authoritative for issuance.

## On-chain controls

- unique project PDA;
- unique verified batch PDA;
- authorized verifier issuance;
- deterministic mint-authority PDA;
- pause;
- verifier rotation;
- two-step authority transfer;
- irreversible burn on retirement;
- one-time retirement receipt.

CCT is not automatically minted from a raw solar meter reading. Carbon methodologies,
additionality/baseline logic and external verification remain separate evidence/policy
domains.
