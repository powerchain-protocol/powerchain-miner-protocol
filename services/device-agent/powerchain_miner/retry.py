from __future__ import annotations

from dataclasses import dataclass


CHAIN_BLOCKING_CODES = {
    "PROOF_SEQUENCE_CONFLICT",
    "PROOF_SEQUENCE_BEHIND",
    "PROOF_DIGEST_CONTINUITY",
    "PROOF_FIRST_DIGEST_INVALID",
    "SOURCE_ROTATION_REQUIRED",
}


@dataclass(frozen=True)
class RetryDecision:
    action: str  # RETRY | DEAD
    delay_seconds: float
    reason: str


def retry_delay_seconds(attempts: int, status: int | None) -> float:
    normalized_attempts = max(0, min(int(attempts), 7))
    base = 15 if status in {425, 429} else 30
    return float(min(3600, base * (2 ** normalized_attempts)))


def classify_http_failure(
    *,
    status: int,
    error_code: str | None,
    attempts: int,
) -> RetryDecision:
    if status in {400, 422} or error_code in CHAIN_BLOCKING_CODES:
        return RetryDecision(
            action="DEAD",
            delay_seconds=0,
            reason="operator correction required to preserve proof-chain integrity",
        )

    return RetryDecision(
        action="RETRY",
        delay_seconds=retry_delay_seconds(attempts, status),
        reason="transient or recoverable server/network state",
    )
