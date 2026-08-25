# PowerChain Renewable Miner — User Guide

## What the miner does

A PowerChain node measures useful renewable-energy activity instead of performing
Proof-of-Work computation.

```text
Solar / wind / hydro / battery / EV
             ↓
         Meter / EMS
             ↓
        Raspberry Pi
             ↓
      Proof of Energy
             ↓
       Miner Backend
             ↓
       Verification
             ↓
        MINER reward
```

## For a node owner

1. Install Renewable Miner on a supported Linux/Raspberry Pi host.
2. Ask the client administrator for a one-time device enrollment key.
3. Configure the meter/EMS adapter.
4. Start the service.
5. Confirm the node is online in the web console.
6. Confirm proofs are being accepted.
7. Review accrued MINER rewards.
8. Use the configured claim workflow when rewards are eligible.

## Important statuses

- **ONLINE** — recent heartbeat received.
- **OFFLINE** — heartbeat is stale.
- **WARNING** — node or measurement requires attention.
- **DISABLED** — administrator has blocked the node.
- **VERIFIED** — backend accepted the evidence.
- **PENDING** — awaiting next processing/settlement stage.
- **CONFIRMED** — Solana settlement has been reconciled.

## Never share

- `/var/lib/powerchain-miner/device-ed25519.pem`
- device API keys
- operator passwords
- treasury/verifier keypairs


## What happens after a node submits energy

A successful upload returns `PENDING_ATTESTATION`.

This means:

1. the server verified the enrolled device signature;
2. sequence/source continuity passed;
3. the evidence was stored;
4. **no MINER reward is final yet**.

The Proof Review workspace or evidence-verifier services must satisfy the client's configured
attestation quorum. Only then does the proof become `VERIFIED` and enter reward accounting.

### Proof Review

Users with the `VERIFIER` role can open `/proofs` to:

- inspect Wh, average power and sample count;
- inspect device/source digest information;
- see existing attestation count;
- approve/reject evidence;
- assign a verified quality score.

Client administrators manage the verification policy under `/rewards`.


## Solana binding status

A node can measure and verify energy while its chain binding is `UNBOUND`, but the settlement
worker will not submit rewards for it.

Client Admins should look for:

```text
UNBOUND  → on-chain registration required
VERIFIED → DeviceAccount + MinerAccount confirmed on Solana
```

Changing the reward owner or the member reward wallet resets the status to `UNBOUND`.
