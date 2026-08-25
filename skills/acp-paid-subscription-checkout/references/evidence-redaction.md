# Checkout evidence redaction

Safe evidence examples:

```json
{
  "merchant": "Example SaaS",
  "plan": "Pro",
  "amount": "29.00",
  "currency": "USD",
  "interval": "monthly",
  "status": "confirmed",
  "orderReference": "ord_...",
  "paymentMethod": "card •••• 1234"
}
```

Never retain authentication secrets or full payment credentials in skill output.
