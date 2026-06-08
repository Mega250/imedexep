import pytest
from unittest.mock import patch

from app.core.config import settings
from app.core.metrics import metrics_collector
from app.core.security import create_access_token
from app.main import _docs_enabled


def get_auth_headers(role="doctor"):
    token = create_access_token(user_id=1, role=role, institution_id=1)
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]


@pytest.mark.asyncio
async def test_live(client):
    response = await client.get("/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_ready(client):
    response = await client.get("/ready")
    assert response.status_code == 200
    assert "db" in response.json()


def test_interactive_docs_disabled_in_production():
    assert _docs_enabled("development") is True
    assert _docs_enabled("testing") is True
    assert _docs_enabled("production") is False


@pytest.mark.asyncio
async def test_metrics_disabled_by_default(client):
    response = await client.get("/metrics")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_metrics_requires_bearer_token(client, monkeypatch):
    monkeypatch.setattr(settings, "metrics_enabled", True)
    monkeypatch.setattr(settings, "metrics_bearer_token", "x" * 32)

    response = await client.get("/metrics")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_metrics_exposes_prometheus_text_when_authorized(client, monkeypatch):
    metrics_collector.reset()
    token = "x" * 32
    monkeypatch.setattr(settings, "metrics_enabled", True)
    monkeypatch.setattr(settings, "metrics_bearer_token", token)

    await client.get("/health")
    response = await client.get("/metrics", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert "imedexp_http_requests_total" in response.text
    assert 'route="/health"' in response.text

@pytest.mark.asyncio
async def test_vitals_validation(client):
    payload = {
        "patient_id": "not-an-int"
    }
    response = await client.post("/api/v1/vitals/", json=payload, headers=get_auth_headers())
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_auth_token_required_for_consultations(client):
    response = await client.post("/api/v1/consultations/", json={"patient_id": 1, "institution_id": 1})
    assert response.status_code == 401

@pytest.mark.asyncio
@patch("app.services.consultation_service.ConsultationService.list_consultations")
async def test_get_consultations_auth(mock_list, client):
    mock_list.return_value = {"items": [], "total": 0, "page": 1, "limit": 20}
    response = await client.get("/api/v1/consultations/", headers=get_auth_headers())
    assert response.status_code == 200
