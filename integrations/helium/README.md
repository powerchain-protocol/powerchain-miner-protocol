# Helium Integration

PowerChain integrates with Helium as a **DePIN connectivity provider**, not as a substitute
for PowerChain energy metering or wallet authorization.

Supported surfaces:

```text
Helium gateway-rs
  └─ single LoRaWAN gateway / on-device identity

Helium multi-gateway
  ├─ GET /gateways
  ├─ GET /gateways/{mac}
  ├─ GET /gateways/{mac}/packets
  ├─ GET /events
  ├─ GET /metrics
  └─ POST /gateways/{mac}/sign   [write key required]

Helium Entity API
  └─ wallet / rewardable-entity metadata

Helium Solana programs
  └─ program + token addresses exposed by @powerchain-protocol/miner/helium
```

## PowerChain backend

Configure:

```env
HELIUM_MULTI_GATEWAY_URL=http://127.0.0.1:4468
HELIUM_MULTI_GATEWAY_READ_API_KEY=
HELIUM_ENTITY_API_URL=https://entities.nft.helium.io
```

Authenticated BFF routes:

```text
GET /api/v1/integrations/helium/gateways
GET /api/v1/integrations/helium/gateways/:mac
GET /api/v1/integrations/helium/gateways/:mac/packets
GET /api/v1/integrations/helium/entity/wallet/:wallet
```

Program/mint registry:

```text
GET /api/v1/integrations/helium/programs
```

The backend deliberately does not proxy arbitrary gateway signing. Gateway signing is a
separate high-consequence capability and must be invoked by trusted server-side integration
code with an explicit write key.

## Gateway identity

Helium gateway keys identify gateways. They are not:

- PowerChain treasury keys;
- Miner verifier keys;
- CCT verifier keys;
- Solana wallet recovery phrases.

Do not copy any of those key classes into another.

## RPM compatibility packaging

Helium currently publishes gateway binaries/releases, and multi-gateway documents a Debian
package. PowerChain includes **compatibility RPM builders** under `linux/rpm/helium/` for
RHEL/Fedora-style edge images.

Those RPMs are PowerChain packaging wrappers, not official Helium packages. The builder
requires an explicit local upstream binary and version so it never downloads an unpinned
"latest" executable.
