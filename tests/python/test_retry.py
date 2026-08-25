import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "device-agent"))

from powerchain_miner.retry import classify_http_failure  # noqa: E402


class RetryPolicyTests(unittest.TestCase):
    def test_policy_not_ready_retries(self):
        decision = classify_http_failure(
            status=425,
            error_code="REWARD_EPOCH_NOT_READY",
            attempts=0,
        )
        self.assertEqual(decision.action, "RETRY")
        self.assertEqual(decision.delay_seconds, 15)

    def test_continuity_conflict_dead_letters(self):
        decision = classify_http_failure(
            status=409,
            error_code="PROOF_DIGEST_CONTINUITY",
            attempts=2,
        )
        self.assertEqual(decision.action, "DEAD")

    def test_rate_limit_backs_off(self):
        decision = classify_http_failure(
            status=429,
            error_code=None,
            attempts=3,
        )
        self.assertEqual(decision.action, "RETRY")
        self.assertEqual(decision.delay_seconds, 120)


if __name__ == "__main__":
    unittest.main()
