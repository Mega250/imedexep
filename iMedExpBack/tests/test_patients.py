import pytest
from unittest.mock import patch
from app.core.security import create_access_token

def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

mock_patient = {
    "id": 1, "curp_encrypted": "encrypted", "first_name_encrypted": "enc", "last_name_encrypted": "enc",
    "date_of_birth_encrypted": "enc", "gender": "M", "blood_type": "O+", "email_encrypted": "enc",
    "phone_encrypted": "enc", "city": None, "state": None, "postal_code": None, "address_line": None,
    "created_at": "2026-01-01T00:00:00Z", "updated_at": "2026-01-01T00:00:00Z", "is_active": True,
    "user_id": 1, "owner_institution_id": 1, "first_name": "John", "last_name": "Doe", "curp": "AAAA000000HAAAAAA0",
    "date_of_birth": "1990-01-01", "email": "a@a.com", "phone": "123",
    "sensitivity_level": 1, "archived_at": None
}

@pytest.mark.asyncio
@patch("app.services.patient_service.PatientService.create_patient")
async def test_create_patient_success(mock_create, client):
    mock_create.return_value = mock_patient
    payload = {"curp": "AAAA000000HAAAAAA0", "first_name": "John", "last_name": "Doe", "date_of_birth": "1990-01-01"}
    response = await client.post("/api/v1/patients/", json=payload, headers=get_auth_headers())
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_create_patient_error(client):
    response = await client.post("/api/v1/patients/", json={}, headers=get_auth_headers())
    assert response.status_code == 422

@pytest.mark.asyncio
@patch("app.services.patient_service.PatientService.list_patients")
async def test_list_patients_success(mock_list, client):
    mock_list.return_value = {"items": [], "total": 0, "page": 1, "limit": 20}
    response = await client.get("/api/v1/patients/", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_list_patients_unauthorized(client):
    response = await client.get("/api/v1/patients/")
    assert response.status_code == 401

@pytest.mark.asyncio
@patch("app.services.patient_service.PatientService.get_patient")
async def test_get_patient_success(mock_get, client):
    mock_get.return_value = mock_patient
    response = await client.get("/api/v1/patients/1", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_patient_unauthorized(client):
    response = await client.get("/api/v1/patients/1")
    assert response.status_code == 401

@pytest.mark.asyncio
@patch("app.services.patient_service.PatientService.get_full_profile")
async def test_get_full_profile_success(mock_get, client):
    mock_full = mock_patient.copy()
    mock_full.update({"institutions": [], "emergency_contacts": [], "appointments": [], "prescriptions": [], "vital_signs": [], "consultations": [], "allergies": []})
    mock_get.return_value = mock_full
    response = await client.get("/api/v1/patients/1/full", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.patient_service.PatientService.update_patient")
async def test_update_patient_success(mock_update, client):
    mock_update.return_value = mock_patient
    response = await client.patch("/api/v1/patients/1", json={"first_name": "Jane"}, headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.patient_service.PatientService.delete_patient")
async def test_delete_patient_success(mock_delete, client):
    response = await client.delete("/api/v1/patients/1", headers=get_auth_headers())
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_delete_patient_forbidden(client):
    response = await client.delete("/api/v1/patients/1", headers=get_auth_headers(role="patient"))
    assert response.status_code == 403
