import pytest
from unittest.mock import patch
from app.core.security import create_access_token

def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_start_consultation_unauthorized(client):
    response = await client.post("/api/v1/consultations/", json={})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_start_consultation_forbidden_role(client):
    headers = get_auth_headers(role="patient")
    response = await client.post("/api/v1/consultations/", json={"patient_id": 1, "institution_id": 1}, headers=headers)
    assert response.status_code == 403

mock_consultation = {
    "id": 1, "parent_id": None, "version": 1, "is_current": True, 
    "appointment_id": None, "institution_id": 1, "patient_id": 1, "doctor_id": 1, 
    "consulted_at": "2026-01-01T00:00:00Z", "chief_complaint": None, "symptoms": None, 
    "medical_notes": None, "sensitivity_level": 1, "specialty_data": None, 
    "signature_hash": None, "signed_at": None, "created_at": "2026-01-01T00:00:00Z"
}

@pytest.mark.asyncio
@patch("app.services.consultation_service.ConsultationService.start_consultation")
async def test_start_consultation_success(mock_start, client):
    mock_start.return_value = mock_consultation
    headers = get_auth_headers(role="doctor")
    payload = {"patient_id": 1, "institution_id": 1}
    response = await client.post("/api/v1/consultations/", json=payload, headers=headers)
    assert response.status_code == 201

@pytest.mark.asyncio
@patch("app.services.consultation_service.ConsultationService.get_consultation")
async def test_get_consultation_success(mock_get, client):
    mock_get.return_value = mock_consultation
    headers = get_auth_headers(role="doctor")
    response = await client.get("/api/v1/consultations/1", headers=headers)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_add_diagnosis_forbidden(client):
    headers = get_auth_headers(role="patient")
    response = await client.post("/api/v1/consultations/1/diagnosis", json={"disease_id": 1, "diagnosis_type": "primary"}, headers=headers)
    assert response.status_code == 403

@pytest.mark.asyncio
@patch("app.services.diagnosis_service.DiagnosisService.add_diagnosis")
async def test_add_diagnosis_success(mock_add, client):
    mock_add.return_value = {"id": 1, "consultation_id": 1, "disease_id": 1, "diagnosis_type": "primary", "created_at": "2026-01-01T00:00:00Z", "additional_notes": None}
    headers = get_auth_headers(role="doctor")
    response = await client.post("/api/v1/consultations/1/diagnosis", json={"disease_id": 1, "diagnosis_type": "primary"}, headers=headers)
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_consultation_prescription_routes_removed(client):
    response = await client.post(
        "/api/v1/consultations/1/prescription",
        json={"general_instructions": "Reposo"},
        headers=get_auth_headers(role="doctor"),
    )
    assert response.status_code == 404
