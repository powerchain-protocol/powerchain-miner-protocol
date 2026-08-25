# Helium Integration

PowerChain can use Helium for LoRaWAN/DePIN connectivity while retaining independent
PowerChain device identity, Proof-of-Energy evidence and settlement controls.

## Helium Solana program IDs

| Program | Address |
|---|---|
| circuit breaker | `circAbx64bbsscPbQzZAUvuXpHqrCe6fLMzc2uKXz9g` |
| data credits | `credMBJhYFzfn7NxBMdU4aUqFggAjgztaCcv2Fo6fPT` |
| entity manager | `hemjuPXBpNvggtaUnN1MwT3wrdhttKEfosTcc2P9Pg8` |
| sub DAOs | `hdaoVTCqhfHHo75XdAMxBKdUqvq1i5bF23sisBqVgGR` |
| lazy distributor | `1azyuavdMyvsivtNxPoz6SucD18eDHeXzFCUPq5XU7w` |
| lazy transactions | `1atrmQs3eq1N2FEYWu6tyTXbCjP4uQwExpjtnhXtS8h` |
| treasury management | `treaf4wWBBty3fHdyBpo35Mz84M8k3heKXmjmi9vFt5` |
| voter stake registry | `hvsrNC3NKbcryqDs2DocYHZ9yPKEVzdSjQG6RVtK1s8` |

Known Helium token mints (HNT, MOBILE, IOT and DC) are exposed from
`@powerchain-protocol/miner/helium`.

## Deployment modes

```text
single/few gateways
  packet forwarder → gateway-rs → Helium router

fleet
  packet forwarders → helium-multi-gateway → Helium router
                                      ├─ REST
                                      ├─ SSE
                                      └─ Prometheus
```

PowerChain reads gateway status/packet metadata through its backend BFF. Arbitrary signing is
not exposed through browser routes.

## Linux packaging

Helium's current ecosystem provides release binaries and Debian packaging for multi-gateway.
For RHEL/Fedora-style PowerChain edge images, compatibility RPM builders live under:

```text
linux/rpm/helium/
```

They require a locally supplied, explicitly versioned upstream binary. They do not fetch an
unversioned executable.

## Security

Keep these identities separate:

```text
Helium gateway key
PowerChain device Ed25519 key
PowerChain evidence-verifier key
Miner Solana verifier key
CCT verifier key
treasury/upgrade authorities
```
