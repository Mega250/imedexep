import pytest
from unittest.mock import patch
from datetime import UTC, datetime, timedelta
from app.core.security import create_access_token


def verification_result(message="Success"):
    now = datetime.now(UTC)
    return {
        "message": message,
        "expires_at": now + timedelta(minutes=15),
        "next_resend_at": now + timedelta(seconds=60),
        "attempts_in_window": 1,
    }

@pytest.mark.asyncio
@patch("app.services.auth_service.AuthService.login")
async def test_login_success(mock_login, client):
    mock_login.return_value = {"access_token": "token", "refresh_token": "refresh", "token_type": "bearer"}
    response = await client.post("/api/v1/auth/login", json={"email": "test@test.com", "password": "password"})
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_login_validation_error(client):
    response = await client.post("/api/v1/auth/login", json={"email": "not-an-email"})
    assert response.status_code == 422

@pytest.mark.asyncio
@patch("app.services.auth_service.AuthService.refresh")
async def test_refresh_success(mock_refresh, client):
    mock_refresh.return_value = {"access_token": "new_token", "refresh_token": "new_refresh", "token_type": "bearer"}
    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": "old"})
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.auth_service.AuthService.get_user_by_id")
async def test_me_success(mock_get_user, client):
    class MockUser:
        id = 1
        email = "test@test.com"
        role = "doctor"
        institution_id = 1
        is_active = True
        access_attributes = {}
    mock_get_user.return_value = MockUser()
    token = create_access_token(user_id=1, role="doctor", institution_id=1)
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_me_unauthorized(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
@patch("app.services.auth_service.AuthService.register_patient")
async def test_register_patient_success(mock_register, client):
    mock_register.return_value = verification_result()
    payload = {
        "email": "p@p.com", "password": "Password123!", "registrado": False,
        "curp": "AAAA000000HAAAAAA4", "first_name": "Ana", "last_name": "Bueno",
        "date_of_birth": "1990-01-01"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

@pytest.mark.asyncio
@patch("app.services.auth_service.AuthService.verify_email")
async def test_verify_email_success(mock_verify, client):
    mock_verify.return_value = {"access_token": "token", "refresh_token": "refresh", "token_type": "bearer"}
    response = await client.post("/api/v1/auth/verify-email", json={"email": "a@a.com", "code": "123456"})
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.auth_service.AuthService.resend_code")
async def test_resend_code_success(mock_resend, client):
    result = verification_result()
    result.pop("message")
    mock_resend.return_value = result
    response = await client.post("/api/v1/auth/resend-code", json={"email": "a@a.com"})
    assert response.status_code == 200

@pytest.mark.asyncio
@patch("app.services.auth_service.AuthService.register_doctor")
async def test_register_doctor_success(mock_register, client):
    mock_register.return_value = verification_result()
    payload = {
        "email": "d@d.com", "password": "Password123!", "first_name": "Gregory", "last_name": "House",
        "general_license": "1234567", "specialty_id": 1
    }
    response = await client.post("/api/v1/auth/register-doctor", json=payload)
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_register_doctor_rejects_invalid_specialty_license(client):
    payload = {
        "email": "d@d.com",
        "password": "Password123!",
        "first_name": "Gregory",
        "last_name": "House",
        "general_license": "1234567",
        "specialty_license": "ABC",
        "specialty_id": 1,
    }
    response = await client.post("/api/v1/auth/register-doctor", json=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
@patch("app.services.secretary_service.SecretaryService.create_secretary")
async def test_create_secretary_success(mock_create, client):
    mock_create.return_value = {
        "id": 1,
        "user_id": 2,
        "first_name": "Ana",
        "last_name": "Perez",
        "employee_number": None,
        "contact_phone": None,
        "email": "s@s.com",
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
        "deleted_at": None,
    }
    token = create_access_token(user_id=1, role="institution_admin", institution_id=1)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "email": "s@s.com",
        "password": "Password123!",
        "first_name": "Ana",
        "last_name": "Perez",
    }
    response = await client.post("/api/v1/secretary/", json=payload, headers=headers)
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_create_secretary_forbidden(client):
    token = create_access_token(user_id=1, role="patient", institution_id=1)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "email": "s@s.com",
        "password": "Password123!",
        "first_name": "Ana",
        "last_name": "Perez",
    }
    response = await client.post("/api/v1/secretary/", json=payload, headers=headers)
    assert response.status_code == 403
