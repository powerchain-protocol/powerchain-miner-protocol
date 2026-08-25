import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "device-agent"))

from powerchain_miner.queue import ProofQueue  # noqa: E402


class ProofQueueTests(unittest.TestCase):
    def test_retry_and_dead_letter_are_durable(self):
        with tempfile.TemporaryDirectory() as temp:
            q = ProofQueue(str(Path(temp) / "queue.sqlite3"))
            row_id = q.enqueue({"sequence": 1})
            ready = q.peek_ready()
            self.assertIsNotNone(ready)
            self.assertEqual(ready[0], row_id)

            q.retry(row_id, error="temporary", http_status=425, delay_seconds=60)
            self.assertIsNone(q.peek_ready())
            self.assertEqual(q.stats()["PENDING"], 1)

            # Force ready for the unit test, then dead-letter it.
            q.db.execute("update proof_queue set next_attempt_at=0 where id=?", (row_id,))
            q.db.commit()
            q.dead_letter(
                row_id,
                error="continuity",
                http_status=409,
                error_code="PROOF_DIGEST_CONTINUITY",
            )
            self.assertEqual(q.stats()["DEAD"], 1)
            dead = q.blocking_dead_letter()
            self.assertEqual(dead["payload"]["sequence"], 1)
            self.assertEqual(dead["last_error_code"], "PROOF_DIGEST_CONTINUITY")

    def test_ack_removes_only_confirmed_row(self):
        with tempfile.TemporaryDirectory() as temp:
            q = ProofQueue(str(Path(temp) / "queue.sqlite3"))
            first = q.enqueue({"sequence": 1})
            q.enqueue({"sequence": 2})
            q.ack(first)
            ready = q.peek_ready()
            self.assertEqual(ready[1]["sequence"], 2)


if __name__ == "__main__":
    unittest.main()
