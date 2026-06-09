import pytest
from unittest.mock import patch
from app.core.security import create_access_token

def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

mock_doctor = {
    "id": 1, "user_id": 1, "first_name": "Dr", "last_name": "House", 
    "general_license": "123", "specialty_license": None, "specialty_id": 1,
    "sub_specialty_id": None, "graduation_university": None, "contact_phone": None,
    "office_location": None, "institution_id": 1, "is_active": True,
    "created_at": "2026-01-01T00:00:00Z", "updated_at": "2026-01-01T00:00:00Z",
    "clearance_level": 1
}

@pytest.mark.asyncio
@patch("app.services.doctor_service.DoctorService.get_doctor")
async def test_get_doctor_success(mock_get, client):
    mock_get.return_value = mock_doctor
    response = await client.get("/api/v1/doctors/1", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.doctor_service.DoctorService.list_doctors")
async def test_list_doctors_success(mock_list, client):
    mock_list.return_value = {"items": [], "total": 0, "page": 1, "limit": 20}
    response = await client.get("/api/v1/doctors/", headers=get_auth_headers())
    assert response.status_code == 200


@pytest.mark.asyncio
@patch("app.services.doctor_service.DoctorService.list_available_for_patient")
async def test_patient_can_list_available_doctors(mock_list, client):
    mock_list.return_value = {"items": [], "total": 0, "page": 1, "limit": 20}
    response = await client.get(
        "/api/v1/doctors/available",
        headers=get_auth_headers(role="patient"),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_patient_cannot_use_staff_doctor_list(client):
    response = await client.get(
        "/api/v1/doctors/",
        headers=get_auth_headers(role="patient"),
    )
    assert response.status_code == 403

@pytest.mark.asyncio
@patch("app.services.doctor_service.DoctorService.update_doctor")
async def test_update_doctor_success(mock_update, client):
    mock_update.return_value = mock_doctor
    response = await client.patch("/api/v1/doctors/1", json={"first_name": "Gregory"}, headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_doctor_endpoints_unauthorized(client):
    r1 = await client.get("/api/v1/doctors/1")
    r2 = await client.get("/api/v1/doctors/")
    r3 = await client.patch("/api/v1/doctors/1", json={})
    assert r1.status_code == 401
    assert r2.status_code == 401
    assert r3.status_code == 401
