from __future__ import annotations

import argparse
import base64
import json
import os
import socket
import time
import tomllib
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from . import __version__
from .queue import ProofQueue
from .integrations import build_integration
from .helpers import source_hash
from .proof_of_energy import build_proof
from .sampling import EnergyAccumulator
from .retry import classify_http_failure, retry_delay_seconds

VERSION = __version__


def canonical_json(obj: dict[str, Any]) -> str:
    return json.dumps(obj, separators=(",", ":"), sort_keys=True)

class Identity:
    def __init__(self, path: str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists():
            pem = self.path.read_bytes()
            self.private = serialization.load_pem_private_key(pem, password=None)
            if not isinstance(self.private, Ed25519PrivateKey):
                raise RuntimeError("Device identity is not an Ed25519 key.")
        else:
            self.private = Ed25519PrivateKey.generate()
            pem = self.private.private_bytes(
                serialization.Encoding.PEM,
                serialization.PrivateFormat.PKCS8,
                serialization.NoEncryption(),
            )
            self.path.write_bytes(pem)
            os.chmod(self.path, 0o600)

    def public_pem(self) -> str:
        return self.private.public_key().public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("ascii")

    def public_raw_base64(self) -> str:
        raw = self.private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        )
        return base64.b64encode(raw).decode("ascii")

    def sign(self, timestamp: str, raw_body: str) -> str:
        sig = self.private.sign(f"{timestamp}.{raw_body}".encode("utf-8"))
        return base64.b64encode(sig).decode("ascii")

def request_json(
    method: str,
    url: str,
    payload: dict[str, Any],
    headers: dict[str, str] | None = None,
    timeout: float = 10.0,
) -> dict[str, Any]:
    raw = canonical_json(payload)
    req = urllib.request.Request(
        url,
        data=raw.encode("utf-8"),
        method=method,
        headers={"content-type": "application/json", **(headers or {})},
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))

def signed_headers(identity: Identity, device_id: str, raw_body: str) -> dict[str, str]:
    timestamp = str(int(time.time()))
    return {
        "x-powerchain-device": device_id,
        "x-powerchain-timestamp": timestamp,
        "x-powerchain-signature": identity.sign(timestamp, raw_body),
    }

def send_signed(
    identity: Identity,
    device_id: str,
    client_id: str,
    url: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    raw = canonical_json(payload)
    timestamp = str(int(time.time()))
    req = urllib.request.Request(
        url,
        data=raw.encode("utf-8"),
        method="POST",
        headers={
            "content-type": "application/json",
            "x-powerchain-device": device_id,
            "x-powerchain-client": client_id,
            "x-powerchain-timestamp": timestamp,
            "x-powerchain-signature": identity.sign(timestamp, raw),
        },
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def parse_http_error(exc: urllib.error.HTTPError) -> tuple[str, str | None]:
    raw = exc.read().decode("utf-8", errors="replace")
    try:
        parsed = json.loads(raw)
        return str(parsed.get("error", raw)), parsed.get("code")
    except Exception:
        return raw, None


def persist_state(path: Path, state: dict[str, Any]) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    encoded = json.dumps(state, indent=2, sort_keys=True)
    with temporary.open("w", encoding="utf-8") as handle:
        handle.write(encoded)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def load_config(path: str) -> dict[str, Any]:
    with open(path, "rb") as fh:
        return tomllib.load(fh)

def read_cpu_percent() -> float | None:
    try:
        first = Path("/proc/stat").read_text().splitlines()[0].split()[1:]
        first = list(map(int, first))
        time.sleep(0.1)
        second = Path("/proc/stat").read_text().splitlines()[0].split()[1:]
        second = list(map(int, second))
        idle1, idle2 = first[3] + first[4], second[3] + second[4]
        total1, total2 = sum(first), sum(second)
        delta = total2 - total1
        return round(100.0 * (1 - ((idle2 - idle1) / delta)), 1) if delta else 0.0
    except Exception:
        return None

def read_temperature_c() -> float | None:
    try:
        raw = Path("/sys/class/thermal/thermal_zone0/temp").read_text().strip()
        return round(int(raw) / 1000, 1)
    except Exception:
        return None

def local_ip() -> str | None:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("1.1.1.1", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None

def run(config_path: str) -> None:
    cfg = load_config(config_path)
    device = cfg["device"]
    server = cfg["server"]
    sampling = cfg.get("sampling", {})
    source_cfg = cfg["source"]

    data_dir = Path(str(device.get("data_dir", "/var/lib/powerchain-miner")))
    data_dir.mkdir(parents=True, exist_ok=True)
    identity = Identity(str(device.get("identity_path", data_dir / "device-ed25519.pem")))
    queue = ProofQueue(str(data_dir / "queue.sqlite3"))
    state_path = data_dir / "state.json"

    state: dict[str, Any] = {"registered": False, "sequence": 0, "previous_digest": ""}
    if state_path.exists():
        try:
            state.update(json.loads(state_path.read_text()))
        except Exception as exc:
            raise RuntimeError(f"Could not read durable miner state: {exc}") from exc

    queued_chain = queue.latest_chain_state()
    if queued_chain and queued_chain[0] > int(state.get("sequence", 0)):
        state["sequence"] = queued_chain[0]
        state["previous_digest"] = queued_chain[1]
        persist_state(state_path, state)

    base_url = str(server["control_plane_url"]).rstrip("/")
    device_id = str(device["id"])

    if not state["registered"] or not state.get("client_id"):
        bootstrap = str(server.get("device_api_key", server.get("bootstrap_token", "")))
        if not bootstrap:
            raise RuntimeError("device_api_key is required for first enrollment")
        registration = {
            "id": device_id,
            "label": str(device.get("label", device_id)),
            "publicKeyPem": identity.public_pem(),
            "publicKeyRawBase64": identity.public_raw_base64(),
            "renewableType": str(device.get("renewable_type", "solar")),
            "source": str(source_cfg.get("kind", "unknown")),
            "model": str(device.get("model", "Raspberry Pi")),
            "firmware": VERSION,
        }
        enrollment = request_json(
            "POST",
            f"{base_url}/api/v1/devices/register",
            registration,
            headers={"authorization": f"Bearer {bootstrap}"},
        )
        state["registered"] = True
        state["client_id"] = enrollment["device"]["client_id"]
        persist_state(state_path, state)
        print(f"[miner] enrolled {device_id} client={state['client_id']}")

    source = build_integration(source_cfg)
    integration_source_hash = source_hash(*source.identity_parts())
    sample_interval = float(sampling.get("sample_interval_seconds", 5))
    proof_interval = float(sampling.get("proof_interval_seconds", 60))
    heartbeat_interval = float(sampling.get("heartbeat_interval_seconds", 30))
    max_sample_gap = float(
        sampling.get("max_sample_gap_seconds", max(10.0, sample_interval * 3))
    )

    accumulator = EnergyAccumulator()
    last_sample_at = time.monotonic()
    last_proof_at = last_sample_at
    last_heartbeat_at = 0.0

    print(f"[miner] PowerChain Renewable Miner {VERSION} running as {device_id}")

    while True:
        now = time.monotonic()

        elapsed = max(0.0, now - last_sample_at)
        last_sample_at = now

        try:
            reading = source.read()
            power_w = max(0.0, reading.power_w)

            # Never extrapolate one reading over an extended telemetry gap.
            accepted_sample = accumulator.add_sample(
                power_w=power_w,
                elapsed_seconds=elapsed,
                quality_bps=int(getattr(reading, "quality_bps", 10_000)),
                max_sample_gap_seconds=max_sample_gap,
            )
            if not accepted_sample:
                print(
                    f"[miner] skipped {elapsed:.1f}s telemetry gap "
                    f"(limit={max_sample_gap:.1f}s)"
                )
        except Exception as exc:
            # `last_sample_at` has already advanced, so a later successful read
            # cannot fabricate energy across this missing interval.
            print(f"[miner] source read failed: {exc}")

        if now - last_heartbeat_at >= heartbeat_interval:
            queue_stats = queue.stats()
            heartbeat = {
                "temperatureC": read_temperature_c(),
                "cpuPercent": read_cpu_percent(),
                "firmware": VERSION,
                "ip": local_ip(),
                "queuePending": queue_stats.get("PENDING", 0),
                "queueDead": queue_stats.get("DEAD", 0),
            }
            try:
                send_signed(
                    identity,
                    device_id,
                    str(state["client_id"]),
                    f"{base_url}/api/v1/devices/heartbeat",
                    heartbeat,
                )
            except Exception as exc:
                print(f"[miner] heartbeat failed: {exc}")
            last_heartbeat_at = now

        if now - last_proof_at >= proof_interval and accumulator.sample_count:
            energy_wh = accumulator.consume_whole_wh()
            if energy_wh > 0:
                next_sequence = int(state.get("sequence", 0)) + 1
                poe = build_proof(
                    sequence=next_sequence,
                    renewable_type=str(device.get("renewable_type", "solar")),
                    energy_wh=energy_wh,
                    average_power_w=accumulator.average_power_w,
                    sample_count=accumulator.sample_count,
                    source=str(source_cfg.get("kind", "unknown")),
                    source_hash=integration_source_hash,
                    previous_digest=str(state.get("previous_digest", "")),
                    quality_bps=accumulator.minimum_quality_bps,
                )
                proof = poe.payload()
                digest = poe.digest()

                queue.enqueue(proof)
                state["sequence"] = next_sequence
                state["previous_digest"] = digest
                persist_state(state_path, state)

            accumulator.clear_window_samples()
            last_proof_at = now

        dead = queue.blocking_dead_letter()
        if dead:
            blocked_sequence = dead["payload"].get("sequence")
            print(
                "[miner] proof chain blocked by dead-letter "
                f"row={dead['id']} sequence={blocked_sequence} "
                f"code={dead.get('last_error_code')} error={dead.get('last_error')}"
            )
        else:
            while True:
                pending = queue.peek_ready()
                if not pending:
                    break

                row_id, proof, attempts = pending
                try:
                    result = send_signed(
                        identity,
                        device_id,
                        str(state["client_id"]),
                        f"{base_url}/api/v1/proofs",
                        proof,
                    )
                    print(
                        f"[miner] proof #{proof['sequence']} stored "
                        f"status={result.get('status')} "
                        f"reward={result.get('rewardBaseUnits', '0')}"
                    )
                    queue.ack(row_id)
                except urllib.error.HTTPError as exc:
                    message, code = parse_http_error(exc)

                    decision = classify_http_failure(
                        status=exc.code,
                        error_code=code,
                        attempts=attempts,
                    )
                    if decision.action == "DEAD":
                        queue.dead_letter(
                            row_id,
                            error=message,
                            http_status=exc.code,
                            error_code=code,
                        )
                        print(
                            f"[miner] proof #{proof['sequence']} dead-lettered "
                            f"HTTP {exc.code} code={code}: {message}"
                        )
                    else:
                        queue.retry(
                            row_id,
                            error=message,
                            http_status=exc.code,
                            error_code=code,
                            delay_seconds=decision.delay_seconds,
                        )
                        print(
                            f"[miner] proof #{proof['sequence']} deferred "
                            f"HTTP {exc.code} code={code} "
                            f"retry={int(decision.delay_seconds)}s: {message}"
                        )
                    break
                except Exception as exc:
                    delay = retry_delay_seconds(attempts, None)
                    queue.retry(
                        row_id,
                        error=str(exc),
                        delay_seconds=delay,
                    )
                    print(
                        f"[miner] proof #{proof['sequence']} upload deferred "
                        f"retry={int(delay)}s: {exc}"
                    )
                    break

        time.sleep(sample_interval)

def main() -> None:
    parser = argparse.ArgumentParser(description="PowerChain Renewable Miner device agent")
    parser.add_argument("--config", default="/etc/powerchain-miner/config.toml")
    args = parser.parse_args()
    run(args.config)

if __name__ == "__main__":
    main()
