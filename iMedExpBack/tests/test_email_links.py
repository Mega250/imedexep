from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.utils import email as email_module


@pytest.mark.asyncio
async def test_doctor_invitation_uses_configured_invitation_screen(monkeypatch):
    send_mock = AsyncMock()
    monkeypatch.setattr(email_module, "_send", send_mock)
    monkeypatch.setattr(
        email_module.settings,
        "frontend_url",
        "https://frontend.example.test/imedexp",
    )

    await email_module.send_doctor_invitation(
        doctor_email="doctor@example.test",
        clinic_name="Clinica de prueba",
        inviter_name="Directora",
    )

    sent_html = send_mock.await_args.args[2]
    assert (
        'href="https://frontend.example.test/imedexp/screen/doc-invites"'
        in sent_html
    )
    assert "Revisar invitaci" in sent_html


def test_frontend_url_is_normalized_and_validated():
    settings = Settings(frontend_url="https://frontend.example.test/")
    assert settings.frontend_url == "https://frontend.example.test"

    with pytest.raises(ValidationError):
        Settings(frontend_url="imedexp.mx")


def test_production_rejects_localhost_frontend_url():
    with pytest.raises(ValidationError):
        Settings(
            app_env="production",
            debug=False,
            jwt_secret_key="x" * 32,
            encryption_key="X9wbQ7u1JwYUsYMijUCio7F5Yrr9XPP78Zih3-ZPNEM=",
            postgres_password="secret",
            cors_allow_origins="https://frontend.example.test",
            frontend_url="http://localhost:8081",
        )
