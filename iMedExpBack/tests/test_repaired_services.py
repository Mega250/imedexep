from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.core.exceptions import ForbiddenError
from app.models.appointment import AppointmentStatus
from app.schemas.appointment import AppointmentUpdate
from app.schemas.auth import TokenPayload
from app.schemas.emergency_contact import EmergencyContactUpdate
from app.services.appointment_service import AppointmentService
from app.services.emergency_contact_service import EmergencyContactService


@pytest.mark.asyncio
async def test_doctor_cannot_update_another_doctors_appointment():
    service = AppointmentService(AsyncMock())
    service.repo.get_by_id = AsyncMock(
        return_value=SimpleNamespace(
            id=1,
            doctor_id=99,
            patient_id=1,
            status=AppointmentStatus.scheduled,
            deleted_at=None,
        )
    )
    caller = TokenPayload(user_id=10, role="doctor", institution_id=1)

    with patch(
        "app.services.appointment_service.resolve_doctor_id_for_token",
        new=AsyncMock(return_value=10),
    ):
        with pytest.raises(ForbiddenError):
            await service.update_appointment(
                1,
                AppointmentUpdate(status=AppointmentStatus.confirmed),
                caller=caller,
            )


@pytest.mark.asyncio
async def test_delete_endpoint_marks_appointment_cancelled():
    service = AppointmentService(AsyncMock())
    service.get_appointment = AsyncMock()
    service.repo.update_fields = AsyncMock(return_value=SimpleNamespace(id=1))
    caller = TokenPayload(user_id=10, role="secretary", institution_id=1)

    await service.cancel_appointment(1, caller=caller)

    service.repo.update_fields.assert_awaited_once_with(
        1,
        {"status": AppointmentStatus.cancelled},
    )


@pytest.mark.asyncio
async def test_unsetting_primary_contact_promotes_a_replacement():
    service = EmergencyContactService(AsyncMock())
    existing = SimpleNamespace(
        id=1,
        patient_id=7,
        full_name="María Pérez",
        phone="5512345678",
        relationship="Madre",
        is_primary=True,
        created_at="2026-01-01T00:00:00Z",
    )
    updated = SimpleNamespace(**{**existing.__dict__, "is_primary": False})
    service.repo.get_by_id = AsyncMock(return_value=existing)
    service.repo.update_fields = AsyncMock(return_value=updated)
    service.repo.promote_oldest = AsyncMock()

    await service.update(
        1,
        EmergencyContactUpdate(is_primary=False),
    )

    service.repo.promote_oldest.assert_awaited_once_with(7)
