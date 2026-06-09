from datetime import date
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.exceptions import NotFoundError, UnprocessableError
from app.schemas.auth import TokenPayload
from app.services.qr_record_access_service import QRRecordAccessService


def _patient() -> SimpleNamespace:
    return SimpleNamespace(
        id=1,
        first_name="Raul",
        last_name="Barrera",
        date_of_birth=date(2004, 12, 10),
        gender=SimpleNamespace(value="M"),
        blood_type=None,
        city="Tehuantepec",
        state="Oaxaca",
    )


@pytest.mark.asyncio
async def test_redeem_links_patient_to_caller_institution():
    session = AsyncMock()
    session.execute = AsyncMock(
        side_effect=[
            SimpleNamespace(scalar_one_or_none=lambda: 1),
            SimpleNamespace(scalar_one_or_none=lambda: _patient()),
        ]
    )
    service = QRRecordAccessService(session)
    service.institution_repo.get_by_id = AsyncMock(
        return_value=SimpleNamespace(id=2, deleted_at=None, is_active=True)
    )
    service.patient_institution_repo.ensure_linked = AsyncMock()

    response = await service.redeem(
        code="ABC12345",
        caller=TokenPayload(user_id=2, role="doctor", institution_id=2),
        institution_id=None,
    )

    assert response.patient.id == 1
    service.institution_repo.get_by_id.assert_awaited_once_with(2)
    service.patient_institution_repo.ensure_linked.assert_awaited_once_with(
        patient_id=1,
        institution_id=2,
    )


@pytest.mark.asyncio
async def test_redeem_requires_institution_id_for_superadmin():
    session = AsyncMock()
    session.execute = AsyncMock(
        side_effect=[
            SimpleNamespace(scalar_one_or_none=lambda: 1),
            SimpleNamespace(scalar_one_or_none=lambda: _patient()),
        ]
    )
    service = QRRecordAccessService(session)
    service.institution_repo.get_by_id = AsyncMock()
    service.patient_institution_repo.ensure_linked = AsyncMock()

    with pytest.raises(UnprocessableError):
        await service.redeem(
            code="ABC12345",
            caller=TokenPayload(user_id=99, role="superadmin", institution_id=None),
            institution_id=None,
        )

    service.institution_repo.get_by_id.assert_not_awaited()
    service.patient_institution_repo.ensure_linked.assert_not_awaited()


@pytest.mark.asyncio
async def test_redeem_validates_institution_before_consuming_qr_code():
    session = AsyncMock()
    service = QRRecordAccessService(session)
    service.institution_repo.get_by_id = AsyncMock(return_value=None)
    service.patient_institution_repo.ensure_linked = AsyncMock()

    with pytest.raises(NotFoundError):
        await service.redeem(
            code="ABC12345",
            caller=TokenPayload(user_id=2, role="doctor", institution_id=2),
            institution_id=None,
        )

    session.execute.assert_not_awaited()
    service.patient_institution_repo.ensure_linked.assert_not_awaited()
