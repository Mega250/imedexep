import pytest
from unittest.mock import patch
from app.core.security import create_access_token

def get_auth_headers(role="secretary"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

mock_appointment = {
    "id": 1, "patient_id": 1, "doctor_id": 1, "institution_id": 1,
    "scheduled_at": "2030-01-01T10:00:00Z",
    "status": "scheduled", "reason": "Checkup", "created_by_user_id": 1,
    "created_at": "2026-01-01T00:00:00Z", "updated_at": "2026-01-01T00:00:00Z"
}

@pytest.mark.asyncio
@patch("app.services.appointment_service.AppointmentService.create_appointment")
async def test_create_appointment_success(mock_create, client):
    mock_create.return_value = mock_appointment
    payload = {"patient_id": 1, "doctor_id": 1, "institution_id": 1, "scheduled_at": "2030-01-01T10:00:00+00:00", "reason": "Checkup"}
    response = await client.post("/api/v1/appointments/", json=payload, headers=get_auth_headers())
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_create_appointment_error(client):
    response = await client.post("/api/v1/appointments/", json={}, headers=get_auth_headers())
    assert response.status_code == 422

@pytest.mark.asyncio
@patch("app.services.appointment_service.AppointmentService.list_appointments")
async def test_list_appointments_success(mock_list, client):
    mock_list.return_value = {"items": [], "total": 0, "page": 1, "limit": 20}
    response = await client.get("/api/v1/appointments/", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_list_appointments_unauthorized(client):
    response = await client.get("/api/v1/appointments/")
    assert response.status_code == 401

@pytest.mark.asyncio
@patch("app.services.appointment_service.AppointmentService.get_appointment")
async def test_get_appointment_success(mock_get, client):
    mock_get.return_value = mock_appointment
    response = await client.get("/api/v1/appointments/1", headers=get_auth_headers())
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.appointment_service.AppointmentService.update_appointment")
async def test_update_appointment_success(mock_update, client):
    mock_update.return_value = mock_appointment
    response = await client.patch("/api/v1/appointments/1", json={"status": "cancelled"}, headers=get_auth_headers())
    assert response.status_code == 200


@pytest.mark.asyncio
@patch("app.services.appointment_service.AppointmentService.update_appointment")
async def test_patient_can_cancel_own_appointment_route(mock_update, client):
    mock_update.return_value = {**mock_appointment, "status": "cancelled"}
    response = await client.patch(
        "/api/v1/appointments/1",
        json={"status": "cancelled"},
        headers=get_auth_headers(role="patient"),
    )
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.appointment_service.AppointmentService.cancel_appointment")
async def test_cancel_appointment_success(mock_cancel, client):
    response = await client.delete("/api/v1/appointments/1", headers=get_auth_headers())
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_cancel_appointment_forbidden(client):
    response = await client.delete("/api/v1/appointments/1", headers=get_auth_headers(role="patient"))
    assert response.status_code == 403
