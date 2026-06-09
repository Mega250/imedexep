from datetime import date

import pytest

from app.services.menstrual_cycle_predictor import CycleObservation, MenstrualCyclePredictor


def test_predictor_classifies_regular_cycles():
    predictor = MenstrualCyclePredictor()
    observations = [
        CycleObservation(date(2026, 1, 1), date(2026, 1, 5)),
        CycleObservation(date(2026, 1, 29), date(2026, 2, 2)),
        CycleObservation(date(2026, 2, 26), date(2026, 3, 2)),
        CycleObservation(date(2026, 3, 26), date(2026, 3, 30)),
    ]

    prediction = predictor.predict(observations, as_of=date(2026, 4, 1))

    assert prediction.regularity == "regular"
    assert prediction.predicted_cycle_length_days == 28
    assert prediction.predicted_period_duration_days == 5
    assert prediction.predicted_next_period_start == date(2026, 4, 23)
    assert prediction.confidence >= 0.5


def test_predictor_widens_window_for_irregular_cycles():
    predictor = MenstrualCyclePredictor()
    observations = [
        CycleObservation(date(2026, 1, 1), date(2026, 1, 4)),
        CycleObservation(date(2026, 1, 23), date(2026, 1, 27)),
        CycleObservation(date(2026, 3, 6), date(2026, 3, 12)),
        CycleObservation(date(2026, 4, 1), date(2026, 4, 4)),
        CycleObservation(date(2026, 5, 29), date(2026, 6, 3)),
    ]

    prediction = predictor.predict(observations, as_of=date(2026, 6, 1))
    window_size = (prediction.prediction_window_end - prediction.prediction_window_start).days

    assert prediction.regularity in {"irregular", "highly_irregular"}
    assert "wide_prediction_window" in prediction.warnings
    assert window_size >= 28


def test_predictor_uses_low_confidence_fallback_with_one_cycle():
    predictor = MenstrualCyclePredictor()

    prediction = predictor.predict(
        [CycleObservation(date(2026, 1, 1), date(2026, 1, 5))],
        as_of=date(2026, 1, 2),
    )

    assert prediction.regularity == "insufficient_data"
    assert prediction.predicted_cycle_length_days == 28
    assert prediction.confidence < 0.25
    assert "limited_data" in prediction.warnings


def test_predictor_requires_observations():
    with pytest.raises(ValueError):
        MenstrualCyclePredictor().predict([], as_of=date(2026, 1, 1))
