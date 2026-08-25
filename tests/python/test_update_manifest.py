import base64
import json
import sys
import tempfile
import unittest
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "device-agent"))

from powerchain_miner.update import verify_manifest  # noqa: E402
from powerchain_miner.utils import canonical_json  # noqa: E402


class UpdateManifestTests(unittest.TestCase):
    def test_signed_manifest_verifies(self):
        key = Ed25519PrivateKey.generate()
        public = key.public_key()

        unsigned = {
            "version": "0.8.0",
            "channel": "stable",
            "platform": "linux",
            "architecture": "arm64",
            "artifactUrl": "https://example.invalid/miner.tar.zst",
            "artifactSha256": "a" * 64,
            "minimumVersion": None,
            "notes": "test",
            "createdAt": "2026-08-24T00:00:00Z",
        }
        signature = key.sign(canonical_json(unsigned).encode("utf-8"))
        manifest = {
            **unsigned,
            "manifestSignature": base64.b64encode(signature).decode("ascii"),
        }

        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "release-public.pem"
            path.write_bytes(
                public.public_bytes(
                    serialization.Encoding.PEM,
                    serialization.PublicFormat.SubjectPublicKeyInfo,
                )
            )
            verify_manifest(manifest, str(path))


if __name__ == "__main__":
    unittest.main()
