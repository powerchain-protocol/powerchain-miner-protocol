from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class EnergyAccumulator:
    accumulated_wh: float = 0.0
    powers_w: list[float] = field(default_factory=list)
    qualities_bps: list[int] = field(default_factory=list)
    skipped_gap_seconds: float = 0.0

    def add_sample(
        self,
        *,
        power_w: float,
        elapsed_seconds: float,
        quality_bps: int,
        max_sample_gap_seconds: float,
    ) -> bool:
        if elapsed_seconds < 0:
            raise ValueError("elapsed_seconds cannot be negative")
        if max_sample_gap_seconds <= 0:
            raise ValueError("max_sample_gap_seconds must be positive")
        if quality_bps < 1 or quality_bps > 10_000:
            raise ValueError("quality_bps must be between 1 and 10000")

        # Missing intervals are not estimated from the next available reading.
        if elapsed_seconds > max_sample_gap_seconds:
            self.skipped_gap_seconds += elapsed_seconds
            return False

        normalized_power = max(0.0, float(power_w))
        self.accumulated_wh += normalized_power * elapsed_seconds / 3600.0
        self.powers_w.append(normalized_power)
        self.qualities_bps.append(int(quality_bps))
        return True

    @property
    def sample_count(self) -> int:
        return len(self.powers_w)

    @property
    def average_power_w(self) -> int:
        if not self.powers_w:
            return 0
        return int(round(sum(self.powers_w) / len(self.powers_w)))

    @property
    def minimum_quality_bps(self) -> int:
        if not self.qualities_bps:
            return 10_000
        return min(self.qualities_bps)

    def consume_whole_wh(self) -> int:
        whole = int(self.accumulated_wh)
        if whole > 0:
            self.accumulated_wh -= whole
        return whole

    def clear_window_samples(self) -> None:
        self.powers_w.clear()
        self.qualities_bps.clear()
        self.skipped_gap_seconds = 0.0
