from dataclasses import dataclass
from datetime import date, timedelta
from math import ceil, sqrt
from statistics import median


MODEL_NAME = "personalized_adaptive_cycle_predictor"
MODEL_VERSION = "1.0.0"
DEFAULT_CYCLE_LENGTH_DAYS = 28
DEFAULT_PERIOD_DURATION_DAYS = 5
MIN_CYCLE_LENGTH_DAYS = 15
MAX_CYCLE_LENGTH_DAYS = 90


@dataclass(frozen=True)
class CycleObservation:
    period_start_date: date
    period_end_date: date | None = None


@dataclass(frozen=True)
class MenstrualPrediction:
    as_of: date
    regularity: str
    average_cycle_length_days: float | None
    cycle_length_stddev_days: float | None
    predicted_cycle_length_days: int
    predicted_period_duration_days: int
    predicted_next_period_start: date
    predicted_next_period_end: date
    prediction_window_start: date
    prediction_window_end: date
    confidence: float
    recent_cycle_lengths_days: list[int]
    warnings: list[str]
    training_sample_size: int


class MenstrualCyclePredictor:
    def predict(
        self,
        observations: list[CycleObservation],
        *,
        as_of: date | None = None,
    ) -> MenstrualPrediction:
        if not observations:
            raise ValueError("Se requiere al menos un ciclo registrado")

        today = as_of or date.today()
        ordered = sorted(
            observations,
            key=lambda item: item.period_start_date,
        )
        intervals = self._cycle_intervals(ordered)
        recent_intervals = intervals[-6:]

        avg = round(sum(intervals) / len(intervals), 2) if intervals else None
        stddev = round(self._stddev(intervals), 2) if len(intervals) > 1 else None
        regularity = self._classify(intervals)
        warnings = self._warnings(intervals, regularity)

        predicted_cycle_length = self._predict_cycle_length(recent_intervals)
        period_duration = self._predict_period_duration(ordered)
        next_start = ordered[-1].period_start_date + timedelta(days=predicted_cycle_length)
        if next_start < today:
            missed_cycles = ((today - next_start).days // predicted_cycle_length) + 1
            next_start += timedelta(days=min(missed_cycles, 24) * predicted_cycle_length)

        next_end = next_start + timedelta(days=period_duration - 1)
        window_days = self._window_days(intervals, regularity)
        confidence = self._confidence(intervals, regularity)

        return MenstrualPrediction(
            as_of=today,
            regularity=regularity,
            average_cycle_length_days=avg,
            cycle_length_stddev_days=stddev,
            predicted_cycle_length_days=predicted_cycle_length,
            predicted_period_duration_days=period_duration,
            predicted_next_period_start=next_start,
            predicted_next_period_end=next_end,
            prediction_window_start=next_start - timedelta(days=window_days),
            prediction_window_end=next_start + timedelta(days=window_days),
            confidence=confidence,
            recent_cycle_lengths_days=recent_intervals,
            warnings=warnings,
            training_sample_size=len(intervals),
        )

    @staticmethod
    def _cycle_intervals(observations: list[CycleObservation]) -> list[int]:
        intervals: list[int] = []
        for previous, current in zip(observations, observations[1:]):
            interval = (current.period_start_date - previous.period_start_date).days
            if MIN_CYCLE_LENGTH_DAYS <= interval <= MAX_CYCLE_LENGTH_DAYS:
                intervals.append(interval)
        return intervals

    @staticmethod
    def _predict_cycle_length(intervals: list[int]) -> int:
        if not intervals:
            return DEFAULT_CYCLE_LENGTH_DAYS
        if len(intervals) == 1:
            return round(_clamp(intervals[0], MIN_CYCLE_LENGTH_DAYS, MAX_CYCLE_LENGTH_DAYS))

        weights = list(range(1, len(intervals) + 1))
        weighted_avg = sum(value * weight for value, weight in zip(intervals, weights)) / sum(weights)
        robust_median = float(median(intervals))
        trend_adjusted = intervals[-1] + _clamp(_slope(intervals), -2.0, 2.0)
        spread = MenstrualCyclePredictor._stddev(intervals)

        if spread > 10:
            predicted = (0.35 * weighted_avg) + (0.55 * robust_median) + (0.10 * intervals[-1])
        else:
            predicted = (0.60 * weighted_avg) + (0.30 * robust_median) + (0.10 * trend_adjusted)

        return round(_clamp(predicted, MIN_CYCLE_LENGTH_DAYS, MAX_CYCLE_LENGTH_DAYS))

    @staticmethod
    def _predict_period_duration(observations: list[CycleObservation]) -> int:
        durations = [
            (item.period_end_date - item.period_start_date).days + 1
            for item in observations
            if item.period_end_date is not None and item.period_end_date >= item.period_start_date
        ]
        if not durations:
            return DEFAULT_PERIOD_DURATION_DAYS

        recent = durations[-6:]
        predicted = median(recent)
        return round(_clamp(float(predicted), 2, 8))

    @staticmethod
    def _classify(intervals: list[int]) -> str:
        if len(intervals) < 2:
            return "insufficient_data"

        avg = sum(intervals) / len(intervals)
        stddev = MenstrualCyclePredictor._stddev(intervals)
        observed_range = max(intervals) - min(intervals)

        if stddev <= 4 and 24 <= avg <= 38:
            return "regular"
        if stddev <= 8 and observed_range <= 14 and 21 <= avg <= 45:
            return "mostly_regular"
        if stddev > 14 or observed_range > 28 or avg < 21 or avg > 60:
            return "highly_irregular"
        return "irregular"

    @staticmethod
    def _window_days(intervals: list[int], regularity: str) -> int:
        if len(intervals) < 2:
            return 7

        stddev = MenstrualCyclePredictor._stddev(intervals)
        if regularity == "regular":
            return max(2, min(4, ceil(stddev)))
        if regularity == "mostly_regular":
            return max(4, min(8, ceil(stddev)))
        if regularity == "highly_irregular":
            return max(14, min(21, ceil(stddev * 1.5)))
        return max(7, min(14, ceil(stddev * 1.25)))

    @staticmethod
    def _confidence(intervals: list[int], regularity: str) -> float:
        if not intervals:
            return 0.18

        sample_score = min(1.0, len(intervals) / 6)
        variability = MenstrualCyclePredictor._stddev(intervals) if len(intervals) > 1 else 8.0
        stability_score = max(0.0, 1.0 - (variability / 24))
        regularity_penalty = {
            "regular": 0.0,
            "mostly_regular": 0.08,
            "irregular": 0.18,
            "highly_irregular": 0.28,
            "insufficient_data": 0.35,
        }.get(regularity, 0.2)
        confidence = 0.20 + (0.72 * sample_score * stability_score) - regularity_penalty
        return round(_clamp(confidence, 0.05, 0.95), 2)

    @staticmethod
    def _warnings(intervals: list[int], regularity: str) -> list[str]:
        warnings: list[str] = []
        if len(intervals) < 2:
            warnings.append("limited_data")
        if regularity in {"irregular", "highly_irregular"}:
            warnings.append("wide_prediction_window")
        if intervals and (min(intervals) < 21 or max(intervals) > 45):
            warnings.append("cycle_lengths_outside_common_range")
        return warnings

    @staticmethod
    def _stddev(values: list[int]) -> float:
        if len(values) < 2:
            return 0.0
        avg = sum(values) / len(values)
        return sqrt(sum((value - avg) ** 2 for value in values) / len(values))


def _slope(values: list[int]) -> float:
    if len(values) < 2:
        return 0.0
    x_avg = (len(values) - 1) / 2
    y_avg = sum(values) / len(values)
    denominator = sum((idx - x_avg) ** 2 for idx in range(len(values)))
    if denominator == 0:
        return 0.0
    numerator = sum((idx - x_avg) * (value - y_avg) for idx, value in enumerate(values))
    return numerator / denominator


def _clamp(value: float | int, minimum: float | int, maximum: float | int) -> float:
    return max(float(minimum), min(float(maximum), float(value)))
