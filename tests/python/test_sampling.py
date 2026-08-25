import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "device-agent"))

from powerchain_miner.sampling import EnergyAccumulator  # noqa: E402


class EnergyAccumulatorTests(unittest.TestCase):
    def test_energy_integration_and_fractional_carry(self):
        acc = EnergyAccumulator()
        # 100 W for 18 s = 0.5 Wh; twice = 1 Wh.
        acc.add_sample(
            power_w=100,
            elapsed_seconds=18,
            quality_bps=10000,
            max_sample_gap_seconds=30,
        )
        self.assertEqual(acc.consume_whole_wh(), 0)
        acc.add_sample(
            power_w=100,
            elapsed_seconds=18,
            quality_bps=9800,
            max_sample_gap_seconds=30,
        )
        self.assertEqual(acc.consume_whole_wh(), 1)
        self.assertAlmostEqual(acc.accumulated_wh, 0.0, places=6)
        self.assertEqual(acc.minimum_quality_bps, 9800)

    def test_missing_telemetry_is_not_extrapolated(self):
        acc = EnergyAccumulator()
        accepted = acc.add_sample(
            power_w=5000,
            elapsed_seconds=3600,
            quality_bps=10000,
            max_sample_gap_seconds=15,
        )
        self.assertFalse(accepted)
        self.assertEqual(acc.accumulated_wh, 0.0)
        self.assertEqual(acc.sample_count, 0)
        self.assertEqual(acc.skipped_gap_seconds, 3600)

    def test_negative_power_is_clamped(self):
        acc = EnergyAccumulator()
        acc.add_sample(
            power_w=-1000,
            elapsed_seconds=10,
            quality_bps=10000,
            max_sample_gap_seconds=15,
        )
        self.assertEqual(acc.accumulated_wh, 0.0)
        self.assertEqual(acc.average_power_w, 0)


if __name__ == "__main__":
    unittest.main()
