# Terminal checkout handoff example

When payment cannot be completed safely in the current runtime:

```json
{
  "state": "REVIEW_REQUIRED",
  "merchant": "Example SaaS",
  "plan": "Pro",
  "amount": "29.00",
  "currency": "USD",
  "interval": "monthly",
  "checkoutUrl": "https://example.invalid/checkout/...",
  "nextStep": "Continue with the approved local ACP checkout runtime.",
  "evidence": {
    "secretsIncluded": false
  }
}
```

Do not mark the purchase `CONFIRMED` until the local payment execution returns verifiable
merchant/payment evidence.
