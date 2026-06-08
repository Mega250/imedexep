from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.diagnosis import Diagnosis
from app.repositories.base import BaseRepository


class DiagnosisRepository(BaseRepository[Diagnosis]):
    model = Diagnosis

    async def create(
        self,
        consultation_id: int,
        disease_id: int,
        diagnosis_type: str = "primary",
        additional_notes: str | None = None,
    ) -> Diagnosis:
        diagnosis = Diagnosis(
            consultation_id=consultation_id,
            disease_id=disease_id,
            diagnosis_type=diagnosis_type,
            additional_notes=additional_notes,
        )
        self.session.add(diagnosis)
        await self.session.flush()
        return diagnosis

    async def list_by_consultation(self, consultation_id: int) -> list[Diagnosis]:
        stmt = select(Diagnosis).where(Diagnosis.consultation_id == consultation_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()
