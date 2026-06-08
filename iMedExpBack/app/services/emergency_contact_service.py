from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError
from app.repositories.emergency_contact_repo import EmergencyContactRepository
from app.schemas.auth import TokenPayload
from app.schemas.emergency_contact import (
    EmergencyContactCreate,
    EmergencyContactResponse,
    EmergencyContactUpdate,
)
from app.utils.ownership import ensure_patient_ownership


class EmergencyContactService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = EmergencyContactRepository(session)

    async def create(
        self,
        patient_id: int,
        data: EmergencyContactCreate,
        caller: TokenPayload | None = None,
    ) -> EmergencyContactResponse:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        existing_contacts = await self.repo.list_by_patient(patient_id)
        is_primary = data.is_primary or not existing_contacts
        if is_primary:
            await self.repo.clear_primary(patient_id)
        contact = await self.repo.create(
            patient_id=patient_id,
            full_name=data.full_name,
            phone=data.phone,
            relationship=data.relationship,
            is_primary=is_primary,
        )
        return EmergencyContactResponse.model_validate(contact)

    async def list_by_patient(
        self,
        patient_id: int,
        caller: TokenPayload | None = None,
    ) -> list[EmergencyContactResponse]:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        contacts = await self.repo.list_by_patient(patient_id)
        return [EmergencyContactResponse.model_validate(c) for c in contacts]

    async def _get_or_raise(self, contact_id: int):
        contact = await self.repo.get_by_id(contact_id)
        if not contact:
            raise NotFoundError("Contacto no encontrado")
        return contact

    async def update(
        self,
        contact_id: int,
        data: EmergencyContactUpdate,
        caller: TokenPayload | None = None,
    ) -> EmergencyContactResponse:
        existing = await self._get_or_raise(contact_id)
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, existing.patient_id)

        fields = data.model_dump(exclude_none=True)
        if not fields:
            return EmergencyContactResponse.model_validate(existing)

        was_primary = existing.is_primary
        if fields.get("is_primary") is True:
            await self.repo.clear_primary(
                existing.patient_id, exclude_contact_id=contact_id
            )
        contact = await self.repo.update_fields(contact_id, fields)
        if not contact:
            raise NotFoundError("Contacto no encontrado")
        if was_primary and fields.get("is_primary") is False:
            await self.repo.promote_oldest(existing.patient_id)
        return EmergencyContactResponse.model_validate(contact)

    async def delete(self, contact_id: int, caller: TokenPayload | None = None) -> None:
        existing = await self._get_or_raise(contact_id)
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, existing.patient_id)
        was_primary = existing.is_primary
        deleted = await self.repo.soft_delete(contact_id)
        if not deleted:
            raise NotFoundError("Contacto no encontrado")
        if was_primary:
            await self.repo.promote_oldest(existing.patient_id)
