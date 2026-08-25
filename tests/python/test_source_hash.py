import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "device-agent"))

from powerchain_miner.helpers import source_hash  # noqa: E402


class SourceHashTests(unittest.TestCase):
    def test_source_hash_is_deterministic_and_order_sensitive(self):
        first = source_hash("modbus_tcp", "meter-01", "192.0.2.10", "502")
        second = source_hash("modbus_tcp", "meter-01", "192.0.2.10", "502")
        changed = source_hash("modbus_tcp", "meter-02", "192.0.2.10", "502")

        self.assertEqual(first, second)
        self.assertNotEqual(first, changed)
        self.assertEqual(len(first), 64)


if __name__ == "__main__":
    unittest.main()
