import pytest
from unittest.mock import patch
from app.core.security import create_access_token


def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

mock_vital = {
    "id": 1, "patient_id": 1, "recorded_at": "2026-01-01T00:00:00Z", 
    "weight": 70.5, "height": 1.75, "heart_rate": 80, 
    "systolic_bp": 120, "diastolic_bp": 80, "bmi": 23.0
}

@pytest.mark.asyncio
@patch("app.services.vital_sign_service.VitalSignService.add_vitals")
async def test_record_vitals_success(mock_add, client):
    mock_add.return_value = mock_vital
    payload = {
        "patient_id": 1,
        "weight": 70.5,
        "height": 1.75
    }
    response = await client.post("/api/v1/vitals/", json=payload, headers=get_auth_headers())
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_record_vitals_validation_error(client):
    payload = {
        "patient_id": "not-a-number"
    }
    response = await client.post("/api/v1/vitals/", json=payload, headers=get_auth_headers())
    assert response.status_code == 422

@pytest.mark.asyncio
@patch("app.services.vital_sign_service.VitalSignService.get_patient_vitals")
async def test_get_patient_vitals_history(mock_get, client):
    mock_get.return_value = [mock_vital]
    response = await client.get("/api/v1/vitals/patient/1", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.vital_sign_service.VitalSignService.get_latest_vitals")
async def test_get_latest_vitals(mock_get_latest, client):
    mock_get_latest.return_value = mock_vital
    response = await client.get("/api/v1/vitals/patient/1/latest", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_patient_vitals_history_validation_error(client):
    response = await client.get("/api/v1/vitals/patient/not-a-number", headers=get_auth_headers())
    assert response.status_code == 422
