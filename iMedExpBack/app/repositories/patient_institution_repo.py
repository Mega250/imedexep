from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.patient_institution import PatientInstitution
from app.repositories.base import BaseRepository


class PatientInstitutionRepository(BaseRepository[PatientInstitution]):
    model = PatientInstitution

    async def create(self, patient_id: int, institution_id: int, record_number: str | None = None) -> PatientInstitution:
        pi = PatientInstitution(
            patient_id=patient_id,
            institution_id=institution_id,
            record_number=record_number,
        )
        self.session.add(pi)
        await self.session.flush()
        await self.session.refresh(pi)
        return pi

    async def get_by_patient_and_institution(self, patient_id: int, institution_id: int) -> PatientInstitution | None:
        result = await self.session.execute(
            select(PatientInstitution).where(
                PatientInstitution.patient_id == patient_id,
                PatientInstitution.institution_id == institution_id,
                PatientInstitution.unlinked_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def list_by_patient(self, patient_id: int) -> list[PatientInstitution]:
        result = await self.session.execute(
            select(PatientInstitution)
            .options(selectinload(PatientInstitution.institution))
            .where(PatientInstitution.patient_id == patient_id)
            .order_by(
                PatientInstitution.unlinked_at.asc().nulls_first(),
                PatientInstitution.linked_at.desc(),
            )
        )
        return list(result.scalars().all())

    async def unlink(self, patient_id: int, institution_id: int) -> bool:
        from sqlalchemy import func
        stmt = (
            update(PatientInstitution)
            .where(
                PatientInstitution.patient_id == patient_id,
                PatientInstitution.institution_id == institution_id,
                PatientInstitution.unlinked_at.is_(None),
            )
            .values(unlinked_at=func.now())
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0
