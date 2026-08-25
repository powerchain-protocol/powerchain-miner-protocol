# Troubleshooting

## `minerctl health` reports inactive

```bash
systemctl status powerchain-miner
journalctl -u powerchain-miner -n 200 --no-pager
```

## Proof queue grows

Check:
- network connectivity
- API URL
- TLS/certificate validity
- device/client enrollment state
- backend logs
- proof rejection response

## Modbus source fails

Confirm the vendor-specific:
- host/port
- unit/device ID
- register address
- register encoding/count
- scaling
- byte/word order where relevant

Never solve a register-map error by guessing values.

## No rewards

Verify:
- proof is VERIFIED
- active reward policy exists
- open reward epoch covers the timestamp
- daily/per-proof caps are not exhausted
- device is assigned to the correct client/owner
