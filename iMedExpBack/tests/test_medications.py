from unittest.mock import patch

import pytest
from app.core.security import create_access_token


def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
@patch("app.services.medication_service.MedicationService.search_medications")
async def test_search_medications_success(mock_search, client):
    mock_search.return_value = [
        {
            "id": 1,
            "generic_name": "Paracetamol",
            "commercial_name": "Tempra",
            "presentation": "Tableta 500mg",
            "administration_route": "oral",
            "display_name": "Paracetamol (Tempra) Tableta 500mg oral",
        }
    ]
    response = await client.get(
        "/api/v1/medications/search?q=para",
        headers=get_auth_headers(),
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_search_medications_validation_error(client):
    response = await client.get(
        "/api/v1/medications/search?q=p",
        headers=get_auth_headers(),
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_search_medications_requires_authentication(client):
    response = await client.get("/api/v1/medications/search?q=para")
    assert response.status_code == 401
