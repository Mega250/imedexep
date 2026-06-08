from unittest.mock import patch

import pytest

from app.core.security import create_access_token


def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}


mock_cycle = {
    "id": 1,
    "patient_id": 1,
    "period_start_date": "2026-01-01",
    "period_end_date": "2026-01-05",
    "flow": "medium",
    "symptoms": {"cramps": "mild"},
    "notes": None,
    "source": "manual",
    "created_at": "2026-01-01T00:00:00Z",
}

mock_prediction = {
    "patient_id": 1,
    "as_of": "2026-04-01",
    "regularity": "regular",
    "average_cycle_length_days": 28.0,
    "cycle_length_stddev_days": 0.0,
    "predicted_cycle_length_days": 28,
    "predicted_period_duration_days": 5,
    "predicted_next_period_start": "2026-04-23",
    "predicted_next_period_end": "2026-04-27",
    "prediction_window_start": "2026-04-21",
    "prediction_window_end": "2026-04-25",
    "confidence": 0.75,
    "recent_cycle_lengths_days": [28, 28, 28],
    "warnings": [],
    "model": {
        "name": "personalized_adaptive_cycle_predictor",
        "version": "1.0.0",
        "training_sample_size": 3,
        "features": ["recent_cycle_lengths"],
    },
}


@pytest.mark.asyncio
@patch("app.services.menstrual_cycle_service.MenstrualCycleService.create_cycle")
async def test_create_menstrual_cycle_success(mock_create, client):
    mock_create.return_value = mock_cycle
    payload = {
        "patient_id": 1,
        "period_start_date": "2026-01-01",
        "period_end_date": "2026-01-05",
        "flow": "medium",
        "symptoms": {"cramps": "mild"},
    }

    response = await client.post(
        "/api/v1/menstrual-cycles/",
        json=payload,
        headers=get_auth_headers(),
    )

    assert response.status_code == 201
    assert response.json()["duration_days"] == 5


@pytest.mark.asyncio
async def test_create_menstrual_cycle_rejects_future_start_date(client):
    payload = {
        "patient_id": 1,
        "period_start_date": "2999-01-01",
    }

    response = await client.post(
        "/api/v1/menstrual-cycles/",
        json=payload,
        headers=get_auth_headers(),
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_menstrual_cycle_rejects_large_symptom_payload(client):
    payload = {
        "patient_id": 1,
        "period_start_date": "2026-01-01",
        "symptoms": {str(index): "x" for index in range(26)},
    }

    response = await client.post(
        "/api/v1/menstrual-cycles/",
        json=payload,
        headers=get_auth_headers(),
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_menstrual_cycles_unauthorized(client):
    response = await client.get("/api/v1/menstrual-cycles/patient/1")

    assert response.status_code == 401


@pytest.mark.asyncio
@patch("app.services.menstrual_cycle_service.MenstrualCycleService.list_patient_cycles")
async def test_list_menstrual_cycles_success(mock_list, client):
    mock_list.return_value = {"patient_id": 1, "total": 1, "items": [mock_cycle]}

    response = await client.get(
        "/api/v1/menstrual-cycles/patient/1",
        headers=get_auth_headers(),
    )

    assert response.status_code == 200
    assert response.json()["total"] == 1


@pytest.mark.asyncio
@patch("app.services.menstrual_cycle_service.MenstrualCycleService.predict_next_cycle")
async def test_predict_menstrual_cycle_success(mock_predict, client):
    mock_predict.return_value = mock_prediction

    response = await client.get(
        "/api/v1/menstrual-cycles/patient/1/prediction?as_of=2026-04-01",
        headers=get_auth_headers(),
    )

    assert response.status_code == 200
    assert response.json()["regularity"] == "regular"


@pytest.mark.asyncio
@patch("app.services.menstrual_cycle_service.MenstrualCycleService.delete_cycle")
async def test_delete_menstrual_cycle_success(mock_delete, client):
    response = await client.delete(
        "/api/v1/menstrual-cycles/1",
        headers=get_auth_headers(),
    )

    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_menstrual_cycle_forbidden_for_secretary(client):
    response = await client.delete(
        "/api/v1/menstrual-cycles/1",
        headers=get_auth_headers(role="secretary"),
    )

    assert response.status_code == 403
