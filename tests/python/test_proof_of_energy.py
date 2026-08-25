import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "device-agent"))

from powerchain_miner.proof_of_energy import build_proof  # noqa: E402

class ProofOfEnergyTests(unittest.TestCase):
    def test_deterministic_shape(self):
        proof = build_proof(
            sequence=1,
            renewable_type="solar",
            energy_wh=100,
            average_power_w=600,
            sample_count=12,
            source="mock",
            source_hash="a" * 64,
            previous_digest="",
            quality_bps=10_000,
        )
        payload = proof.payload()
        self.assertEqual(payload["energyDeltaWh"], 100)
        self.assertEqual(payload["qualityBps"], 10_000)
        self.assertEqual(len(proof.digest()), 64)

    def test_cross_runtime_vector(self):
        import hashlib
        import json
        vector_path = ROOT / "tests" / "fixtures" / "proof-of-energy.vector.json"
        vector = json.loads(vector_path.read_text())
        canonical = json.dumps(vector["proof"], separators=(",", ":"), sort_keys=True)
        self.assertEqual(canonical, vector["canonicalJson"])
        self.assertEqual(hashlib.sha256(canonical.encode()).hexdigest(), vector["sha256"])

    def test_quality_range(self):
        with self.assertRaises(ValueError):
            build_proof(
                sequence=1,
                renewable_type="solar",
                energy_wh=1,
                average_power_w=1,
                sample_count=1,
                source="mock",
                source_hash="a" * 64,
                previous_digest="",
                quality_bps=10_001,
            )

if __name__ == "__main__":
    unittest.main()
