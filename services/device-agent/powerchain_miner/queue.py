from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path
from typing import Any


class ProofQueue:
    def __init__(self, path: str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(self.path)
        self.db.row_factory = sqlite3.Row

        self.db.execute(
            """CREATE TABLE IF NOT EXISTS proof_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )"""
        )

        columns = {
            row["name"]
            for row in self.db.execute("PRAGMA table_info(proof_queue)").fetchall()
        }
        migrations = {
            "status": "ALTER TABLE proof_queue ADD COLUMN status TEXT NOT NULL DEFAULT 'PENDING'",
            "attempts": "ALTER TABLE proof_queue ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0",
            "next_attempt_at": "ALTER TABLE proof_queue ADD COLUMN next_attempt_at REAL NOT NULL DEFAULT 0",
            "last_error": "ALTER TABLE proof_queue ADD COLUMN last_error TEXT",
            "last_http_status": "ALTER TABLE proof_queue ADD COLUMN last_http_status INTEGER",
            "last_error_code": "ALTER TABLE proof_queue ADD COLUMN last_error_code TEXT",
        }
        for column, statement in migrations.items():
            if column not in columns:
                self.db.execute(statement)

        self.db.execute(
            "CREATE INDEX IF NOT EXISTS idx_proof_queue_ready "
            "ON proof_queue(status,next_attempt_at,id)"
        )
        self.db.commit()

    def enqueue(self, payload: dict[str, Any]) -> int:
        encoded = json.dumps(payload, separators=(",", ":"), sort_keys=True)
        cursor = self.db.execute(
            "INSERT INTO proof_queue(payload,status,next_attempt_at) VALUES (?, 'PENDING', 0)",
            (encoded,),
        )
        self.db.commit()
        return int(cursor.lastrowid)

    def peek_ready(self) -> tuple[int, dict[str, Any], int] | None:
        row = self.db.execute(
            """SELECT id,payload,attempts
                 FROM proof_queue
                WHERE status='PENDING' AND next_attempt_at <= ?
                ORDER BY id
                LIMIT 1""",
            (time.time(),),
        ).fetchone()
        if not row:
            return None
        return int(row["id"]), json.loads(row["payload"]), int(row["attempts"])

    def blocking_dead_letter(self) -> dict[str, Any] | None:
        row = self.db.execute(
            """SELECT id,payload,attempts,last_error,last_http_status,last_error_code
                 FROM proof_queue
                WHERE status='DEAD'
                ORDER BY id
                LIMIT 1"""
        ).fetchone()
        if not row:
            return None
        return {
            "id": int(row["id"]),
            "payload": json.loads(row["payload"]),
            "attempts": int(row["attempts"]),
            "last_error": row["last_error"],
            "last_http_status": row["last_http_status"],
            "last_error_code": row["last_error_code"],
        }

    def ack(self, row_id: int) -> None:
        self.db.execute("DELETE FROM proof_queue WHERE id=?", (row_id,))
        self.db.commit()

    def retry(
        self,
        row_id: int,
        *,
        error: str,
        http_status: int | None = None,
        error_code: str | None = None,
        delay_seconds: float = 30.0,
    ) -> None:
        self.db.execute(
            """UPDATE proof_queue
                  SET attempts=attempts+1,
                      next_attempt_at=?,
                      last_error=?,
                      last_http_status=?,
                      last_error_code=?
                WHERE id=?""",
            (
                time.time() + max(1.0, delay_seconds),
                error[:2000],
                http_status,
                error_code,
                row_id,
            ),
        )
        self.db.commit()

    def dead_letter(
        self,
        row_id: int,
        *,
        error: str,
        http_status: int | None = None,
        error_code: str | None = None,
    ) -> None:
        self.db.execute(
            """UPDATE proof_queue
                  SET status='DEAD',
                      attempts=attempts+1,
                      last_error=?,
                      last_http_status=?,
                      last_error_code=?
                WHERE id=?""",
            (error[:2000], http_status, error_code, row_id),
        )
        self.db.commit()

    def latest_chain_state(self) -> tuple[int, str] | None:
        rows = self.db.execute(
            "SELECT payload FROM proof_queue ORDER BY id DESC"
        ).fetchall()
        for row in rows:
            payload = json.loads(row["payload"])
            sequence = payload.get("sequence")
            if isinstance(sequence, int) and sequence > 0:
                import hashlib
                canonical = json.dumps(
                    payload,
                    separators=(",", ":"),
                    sort_keys=True,
                    ensure_ascii=False,
                )
                digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
                return sequence, digest
        return None

    def stats(self) -> dict[str, int]:
        rows = self.db.execute(
            "SELECT status,count(*) AS count FROM proof_queue GROUP BY status"
        ).fetchall()
        values = {"PENDING": 0, "DEAD": 0}
        for row in rows:
            values[str(row["status"])] = int(row["count"])
        return values
