from sqlalchemy import select, update, func
from app.models.emergency_contact import EmergencyContact
from app.repositories.base import BaseRepository


class EmergencyContactRepository(BaseRepository[EmergencyContact]):
    model = EmergencyContact

    async def create(self, patient_id: int, **kwargs) -> EmergencyContact:
        contact = EmergencyContact(patient_id=patient_id, **kwargs)
        self.session.add(contact)
        await self.session.flush()
        await self.session.refresh(contact)
        return contact

    async def list_by_patient(self, patient_id: int) -> list[EmergencyContact]:
        result = await self.session.execute(
            select(EmergencyContact).where(
                EmergencyContact.patient_id == patient_id,
                EmergencyContact.deleted_at.is_(None),
            ).order_by(EmergencyContact.is_primary.desc())
        )
        return list(result.scalars().all())

    async def update_fields(self, contact_id: int, fields: dict) -> EmergencyContact | None:
        stmt = (
            update(EmergencyContact)
            .where(
                EmergencyContact.id == contact_id,
                EmergencyContact.deleted_at.is_(None),
            )
            .values(**fields)
            .execution_options(synchronize_session="fetch")
        )
        await self.session.execute(stmt)
        await self.session.flush()
        self.session.expire_all()
        
        result = await self.session.execute(
            select(EmergencyContact)
            .where(EmergencyContact.id == contact_id)
            .execution_options(populate_existing=True)
        )
        return result.scalar_one_or_none()

    async def clear_primary(
        self,
        patient_id: int,
        exclude_contact_id: int | None = None,
    ) -> None:
        stmt = update(EmergencyContact).where(
            EmergencyContact.patient_id == patient_id,
            EmergencyContact.deleted_at.is_(None),
            EmergencyContact.is_primary.is_(True),
        )
        if exclude_contact_id is not None:
            stmt = stmt.where(EmergencyContact.id != exclude_contact_id)
        await self.session.execute(stmt.values(is_primary=False))

    async def promote_oldest(self, patient_id: int) -> None:
        result = await self.session.execute(
            select(EmergencyContact.id)
            .where(
                EmergencyContact.patient_id == patient_id,
                EmergencyContact.deleted_at.is_(None),
            )
            .order_by(EmergencyContact.created_at, EmergencyContact.id)
            .limit(1)
        )
        contact_id = result.scalar_one_or_none()
        if contact_id is not None:
            await self.session.execute(
                update(EmergencyContact)
                .where(EmergencyContact.id == contact_id)
                .values(is_primary=True)
            )
