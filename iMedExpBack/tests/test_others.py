import pytest
from unittest.mock import patch
from app.core.security import create_access_token
from app.schemas.personal_log import PersonalLogCreate

def get_auth_headers():
    token = create_access_token(user_id=1, role="superadmin", institution_id=1)
    return {"Authorization": f"Bearer {token}"}

def get_institution_admin_headers():
    token = create_access_token(user_id=1, role="institution_admin", institution_id=1)
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_other_unauthorized(client):
    assert (await client.post("/api/v1/institutions/", json={})).status_code == 401
    assert (await client.get("/api/v1/institutions/1")).status_code == 401
    assert (await client.post("/api/v1/emergency-contacts/1", json={})).status_code == 401
    assert (await client.patch("/api/v1/invitations/1", json={"accept": True})).status_code == 401

@pytest.mark.asyncio
@patch("app.services.institution_service.InstitutionService.create_institution")
async def test_institutions_success(mock_create, client):
    mock_create.return_value = {"id": 1, "name": "Hospital", "type": "hospital", "created_at": "2026-01-01T00:00:00Z", "is_active": True, "deleted_at": None, "address": None, "phone": None}
    response = await client.post("/api/v1/institutions/", json={"name": "Hospital", "type": "hospital"}, headers=get_auth_headers())
    assert response.status_code in [201, 200]

@pytest.mark.asyncio
@patch("app.services.emergency_contact_service.EmergencyContactService.create")
async def test_emergency_contact_success(mock_add, client):
    mock_add.return_value = {"id": 1, "patient_id": 1, "full_name": "Mom", "phone": "1234567890", "relationship": "Mother", "is_primary": False, "created_at": "2026-01-01T00:00:00Z"}
    response = await client.post("/api/v1/emergency-contacts/1", json={"patient_id": 1, "full_name": "Mom", "phone": "1234567890", "relationship": "Mother"}, headers=get_auth_headers())
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_emergency_contact_validation(client):
    response = await client.post("/api/v1/emergency-contacts/1", json={"patient_id": 1}, headers=get_auth_headers())
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_institutions_validation(client):
    response = await client.post("/api/v1/institutions/", json={"name": ""}, headers=get_auth_headers())
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_invitations_validation(client):
    response = await client.post("/api/v1/invitations/", json={"doctor_email": "not-an-email"}, headers=get_institution_admin_headers())
    assert response.status_code == 422


def test_personal_log_accepts_spanish_names():
    payload = PersonalLogCreate(
        role="estudiante",
        fields={"nombre": "María José Núñez"},
    )
    assert payload.fields["nombre"] == "María José Núñez"


@pytest.mark.asyncio
@patch("app.services.secretary_service.SecretaryService.unassign_from_doctor")
async def test_unassign_secretary_from_doctor(mock_unassign, client):
    mock_unassign.return_value = {"message": "Asignacion eliminada con exito."}
    response = await client.delete(
        "/api/v1/secretary/2/doctors/3",
        headers=get_institution_admin_headers(),
    )
    assert response.status_code == 200
