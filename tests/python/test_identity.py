import base64
import sys
import tempfile
import unittest
from pathlib import Path

from cryptography.hazmat.primitives import serialization

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "device-agent"))

from powerchain_miner.agent import Identity  # noqa: E402
from powerchain_miner.inspect import identity_solana  # noqa: E402


class IdentityTests(unittest.TestCase):
    def test_pem_and_raw_key_are_same_identity(self):
        with tempfile.TemporaryDirectory() as temp:
            identity = Identity(str(Path(temp) / "device.pem"))
            raw = base64.b64decode(identity.public_raw_base64())
            public = identity.private.public_key().public_bytes(
                serialization.Encoding.Raw,
                serialization.PublicFormat.Raw,
            )
            self.assertEqual(len(raw), 32)
            self.assertEqual(raw, public)

    def test_solana_identity_is_base58(self):
        with tempfile.TemporaryDirectory() as temp:
            path = str(Path(temp) / "device.pem")
            Identity(path)
            value = identity_solana(path)
            self.assertGreaterEqual(len(value), 32)
            self.assertLessEqual(len(value), 44)
            self.assertNotIn("0", value)
            self.assertNotIn("O", value)

    def test_identity_is_persistent(self):
        with tempfile.TemporaryDirectory() as temp:
            path = str(Path(temp) / "device.pem")
            first = Identity(path).public_raw_base64()
            second = Identity(path).public_raw_base64()
            self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main()
