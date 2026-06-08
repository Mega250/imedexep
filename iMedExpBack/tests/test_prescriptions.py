import pytest
from unittest.mock import patch
from app.core.security import create_access_token

def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_prescription_unauthorized(client):
    response = await client.post("/api/v1/prescriptions/consultation/1", json={})
    assert response.status_code == 401

mock_prescription = {
     "id": 1, "consultation_id": 1, "patient_id": 1, "doctor_id": 1, 
     "doctor_name": None, "patient_name": None, "general_instructions": "Take rest",
     "issued_at": "2026-01-01T00:00:00Z", "signature_hash": None,"signed_at": None, "treatments": []
 }

@pytest.mark.asyncio
@patch("app.services.prescription_service.PrescriptionService.create_prescription")
async def test_create_prescription_success(mock_create, client):
    mock_create.return_value = mock_prescription
    headers = get_auth_headers()
    response = await client.post("/api/v1/prescriptions/consultation/1", json={"general_instructions": "Take rest"}, headers=headers)
    assert response.status_code == 201

@pytest.mark.asyncio
@patch("app.services.prescription_service.PrescriptionService.get_prescription")
async def test_get_prescription_success(mock_get, client):
    mock_get.return_value = mock_prescription
    headers = get_auth_headers()
    response = await client.get("/api/v1/prescriptions/1", headers=headers)
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.prescription_service.PrescriptionService.sign_prescription")
async def test_sign_prescription_success(mock_sign, client):
    signed_mock = mock_prescription.copy()
    signed_mock["signature_hash"] = "abcdef"
    mock_sign.return_value = signed_mock
    headers = get_auth_headers()
    response = await client.patch("/api/v1/prescriptions/1/sign", json={"signature_hash": "abcdef"}, headers=headers)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_sign_prescription_validation_error(client):
    headers = get_auth_headers()
    response = await client.patch("/api/v1/prescriptions/1/sign", json={}, headers=headers)
    assert response.status_code == 422

@pytest.mark.asyncio
@patch("app.services.prescription_service.PrescriptionService.add_treatment")
async def test_add_treatment_success(mock_add, client):
    mock_add.return_value = {
        "id": 1,
        "prescription_id": 1,
        "medication_id": 1,
        "free_text_medication": None,
        "dosage": "1 pastilla",
        "frequency": "cada 8 horas",
        "duration_days": 5,
        "start_date": "2026-01-01",
        "status": "active",
        "calculated_end_date": "2026-01-06",
        "additional_notes": None,
    }
    payload = {
        "dosage": "1 pastilla",
        "frequency": "cada 8 horas",
        "duration_days": 5,
        "start_date": "2026-01-01",
        "medication_id": 1,
    }
    response = await client.post("/api/v1/prescriptions/1/treatments", json=payload, headers=get_auth_headers())
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_add_treatment_missing_fields(client):
    payload = {"start_date": "2026-01-01", "medication_id": 1}
    response = await client.post("/api/v1/prescriptions/1/treatments", json=payload, headers=get_auth_headers())
    assert response.status_code == 422
