from __future__ import annotations
import argparse
import base64
import hashlib
import json
import platform
import urllib.request
from pathlib import Path
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from .utils import canonical_json

def architecture() -> str:
    machine = platform.machine().lower()
    if machine in {"aarch64", "arm64"}:
        return "arm64"
    if machine in {"x86_64", "amd64"}:
        return "x86_64"
    raise RuntimeError(f"Unsupported architecture: {machine}")

def verify_manifest(manifest: dict, public_key_path: str) -> None:
    signature_b64 = manifest.get("manifestSignature")
    if not signature_b64:
        raise RuntimeError("Release manifest has no signature.")
    unsigned = {key: value for key, value in manifest.items() if key != "manifestSignature"}
    key = serialization.load_pem_public_key(Path(public_key_path).read_bytes())
    if not isinstance(key, Ed25519PublicKey):
        raise RuntimeError("Update signing key must be Ed25519.")
    key.verify(base64.b64decode(signature_b64), canonical_json(unsigned).encode("utf-8"))

def download_and_verify(url: str, expected_sha256: str, destination: str) -> None:
    digest = hashlib.sha256()
    dest = Path(destination)
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=30) as response, dest.open("wb") as output:
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
            output.write(chunk)
    actual = digest.hexdigest()
    if actual != expected_sha256:
        dest.unlink(missing_ok=True)
        raise RuntimeError(f"Release hash mismatch: expected {expected_sha256}, got {actual}")

def main() -> None:
    parser = argparse.ArgumentParser(description="PowerChain signed release checker")
    parser.add_argument("--api-url", required=True)
    parser.add_argument("--public-key", required=True)
    parser.add_argument("--channel", default="stable", choices=["stable", "beta", "canary"])
    parser.add_argument("--platform", default="linux", choices=["linux", "raspberrypi"])
    parser.add_argument("--download")
    args = parser.parse_args()

    query = f"channel={args.channel}&platform={args.platform}&architecture={architecture()}"
    url = f"{args.api_url.rstrip('/')}/api/v1/releases/latest?{query}"
    with urllib.request.urlopen(url, timeout=10) as response:
        manifest = json.loads(response.read().decode("utf-8"))

    verify_manifest(manifest, args.public_key)
    print(json.dumps(manifest, indent=2))

    if args.download:
        download_and_verify(manifest["artifactUrl"], manifest["artifactSha256"], args.download)
        print(f"verified artifact: {args.download}")

if __name__ == "__main__":
    main()
